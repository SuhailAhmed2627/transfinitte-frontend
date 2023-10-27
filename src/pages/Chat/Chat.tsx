import {
	MainContainer,
	ChatContainer,
	MessageList,
	Message,
	MessageInput,
	MessageModel,
	TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { dataFetch, getUser } from "../../utils/helpers";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { Button, Center, Loader, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { Rating } from "react-simple-star-rating";

const someMessages: MessageModel[] = [
	{
		message: "Hi",
		direction: "incoming",
		position: "first",
	},
	{
		message: "Hello",
		direction: "outgoing",
		position: "normal",
	},
	{
		message: "How are you?",
		direction: "incoming",
		position: "normal",
	},
	{
		message: "I'm fine",
		direction: "outgoing",
		position: "last",
	},
];

type ServerConversation = {
	chat_id: number;
	text: string;
	response: string;
	feedback: number;
	created_at: string;
};

const sampleServerMessages: ServerConversation[] = [
	{
		chat_id: 1,
		text: "Hi",
		response: "Hello",
		feedback: -1,
		created_at: "2021-08-26T13:17:00.000000Z",
	},
	{
		chat_id: 2,
		text: "How are you?",
		response: "I'm fine",
		feedback: -1,
		created_at: "2021-08-26T13:17:00.000000Z",
	},
];

const newSampleServerMessage: ServerConversation = {
	chat_id: 3,
	text: "What is your name?",
	response: "My name is Tle, Bottle",
	feedback: -1,
	created_at: "2021-08-26T13:17:00.000000Z",
};

const processSeverMessages = (
	messages: ServerConversation[]
): MessageModel[] => {
	const processedMessages: MessageModel[] = [];

	for (let i = 0; i < messages.length; i++) {
		const serverMessage = messages[i];
		const userMessage: MessageModel = {
			message: serverMessage.text,
			direction: "outgoing",
			position: i === 0 ? "first" : "normal",
		};
		const botMessage: MessageModel = {
			message: serverMessage.response,
			direction: "incoming",
			position: i === messages.length - 1 ? "last" : "normal",
			payload: {
				rating: serverMessage.feedback,
				chatId: serverMessage.chat_id,
			},
		};
		processedMessages.push(userMessage);
		processedMessages.push(botMessage);
	}

	return processedMessages;
};

const makeNewMessage = (text: string): MessageModel => {
	return {
		message: text,
		direction: "outgoing",
		position: "last",
	};
};

interface NewMessage {
	text: string;
}

const Chat = () => {
	const user = getUser();
	const [messages, setMessages] = useState<MessageModel[] | null>(null);
	const [opened, { open, close }] = useDisclosure(false);
	const [rateId, setRateId] = useState<string | null>(null);
	const [ratingValue, setRatingValue] = useState(0);
	const navigate = useNavigate();

	const previousMessagesQuery = useQuery({
		queryKey: "previousMessages",
		queryFn: async () => {
			return await dataFetch({
				url: "/chat/all",
				method: "GET",
			});
		},
		onSuccess: async (res) => {
			if (true || res.ok) {
				const data = await res.json();
				setMessages(processSeverMessages(sampleServerMessages));
			}
		},
	});

	const sendMessageMutation = useMutation({
		mutationKey: "sendMessage",
		mutationFn: async (newMessage: NewMessage) => {
			return await dataFetch({
				url: "/chat/new",
				method: "POST",
				body: newMessage,
			});
		},
		onSuccess: async (res) => {
			if (true || res.ok) {
				const data = await res.json();
				if (messages === null) {
					return;
				}
				setMessages([
					...messages,
					...processSeverMessages([newSampleServerMessage]),
				]);
			}
		},
	});

	const rateMutation = useMutation({
		mutationKey: "rateResponse",
		mutationFn: async ({
			stars,
			chatId,
		}: {
			stars: number;
			chatId: string;
		}) => {
			return await dataFetch({
				url: "/chat/rate",
				method: "POST",
				body: {
					stars: stars,
					chatId: chatId,
				},
			});
		},
		onSuccess: async (res) => {
			if (true || res.ok) {
				// const data = await res.json();
				const data = {
					chatId: 2,
					ratingValue: 4,
				};
				if (messages === null) {
					return;
				}
				const updatedMessages = [...messages];
				updatedMessages.forEach((m) => {
					if (m.payload && (m.payload as any).chatId === data.chatId) {
						(m.payload as any).rating = data.ratingValue;
					}
				});
				setMessages(updatedMessages);
				close();
				setRateId(null);
				setRatingValue(0);
			}
		},
	});

	if (!user) {
		navigate("/login");
		return (
			<Center className="h-screen w-screen">
				<Loader />
			</Center>
		);
	}

	if (previousMessagesQuery.isLoading) {
		return (
			<Center className="h-screen w-screen">
				<Loader />
			</Center>
		);
	}

	if (
		previousMessagesQuery.isError ||
		(previousMessagesQuery.isSuccess && messages === null)
	) {
		return (
			<Center className="h-screen w-screen">
				<h1>Some Error Occured</h1>
			</Center>
		);
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={() => {
					setRateId(null);
					setRatingValue(0);
					close();
				}}
				title="Rate the Response"
				centered
			>
				<Stack>
					<Center>
						<div
							style={{
								direction: "ltr",
								fontFamily: "sans-serif",
								touchAction: "none",
							}}
						>
							<Rating
								fillColorArray={[
									"#f14f45",
									"#f16c45",
									"#f18845",
									"#f1b345",
									"#f1d045",
								]}
								initialValue={ratingValue}
							/>
						</div>
					</Center>
					<Button
						onClick={() => {
							rateMutation.mutate({
								stars: ratingValue,
								chatId: rateId as string,
							});
						}}
					>
						Submit Rating
					</Button>
				</Stack>
			</Modal>
			<Center className="h-screen w-screen bg-gray-100">
				<div className=" h-[95%] w-[60%]">
					<MainContainer>
						<ChatContainer>
							<MessageList>
								{messages !== null &&
									messages.map((message, index) => (
										<Message
											key={index}
											model={{
												message: message.message,
												direction: message.direction,
												position: message.position,
											}}
										>
											{message.direction === "incoming" && (
												<Message.Footer>
													{((message.payload as any)
														.rating as number) === -1 ? (
														<Text
															onClick={() => {
																setRateId(
																	(message.payload as any)
																		.chatId as string
																);
																open();
															}}
															className=" text-xs underline cursor-pointer"
														>
															Give Feedback
														</Text>
													) : (
														<div>
															<Rating
																fillColorArray={[
																	"#f14f45",
																	"#f16c45",
																	"#f18845",
																	"#f1b345",
																	"#f1d045",
																]}
																readonly
																size={15}
																initialValue={
																	(message.payload as any)
																		.rating as number
																}
															/>
														</div>
													)}
												</Message.Footer>
											)}
										</Message>
									))}
								{sendMessageMutation.isLoading && (
									<TypingIndicator
										className="h-[unset]"
										content="Bot is typing"
									/>
								)}
							</MessageList>
							<MessageInput
								onSend={(message) => {
									if (messages === null) {
										setMessages([makeNewMessage(message)]);
									} else {
										setMessages([
											...messages,
											makeNewMessage(newSampleServerMessage.text),
										]);
									}
									sendMessageMutation.mutate({
										text: newSampleServerMessage.text,
									});
								}}
								placeholder="Type message here"
							/>
						</ChatContainer>
					</MainContainer>
				</div>
			</Center>
		</>
	);
};

export default Chat;
