import {
	MainContainer,
	ChatContainer,
	MessageList,
	Message,
	MessageInput,
	MessageModel,
	TypingIndicator,
	InputToolbox,
	InfoButton,
} from "@chatscope/chat-ui-kit-react";
import { dataFetch, getUser, showNotification } from "../../utils/helpers";
import {
	Button,
	Center,
	Loader,
	Modal,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { Rating } from "react-simple-star-rating";
import { SpecialInputs } from "../../components";
import "./main.scss";
import "./override.css";
import { IconMicrophone } from "@tabler/icons-react";

type ServerConversation = {
	chat_id: number;
	text: string;
	response: string;
	feedback: number;
	created_at: string;
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
	const ratingModal = useDisclosure(false);
	const specialModal = useDisclosure(false);
	const [rateId, setRateId] = useState<string | null>(null);
	const [ratingValue, setRatingValue] = useState(0);
	const navigate = useNavigate();
	const [currentInput, setCurrentInput] = useState<string>("");
	const [feedback, setFeedback] = useState<string>("");

	const previousMessagesQuery = useQuery({
		queryKey: "previousMessages",
		queryFn: async () => {
			return await dataFetch({
				user: user,
				url: "/chat/all",
				method: "GET",
			});
		},
		onSuccess: async (res) => {
			if (res.ok) {
				const data = await res.json();
				setMessages(processSeverMessages(data.chat_history));
			}
		},
		onError: () => {
			showNotification("Error", "Some error occured", "error");
		},
	});

	const sendMessageMutation = useMutation({
		mutationKey: "sendMessage",
		mutationFn: async (newMessage: NewMessage) => {
			return await dataFetch({
				user: user,
				url: "/chat/new_test",
				method: "POST",
				body: newMessage,
			});
		},
		onSuccess: async (res) => {
			if (res.ok) {
				const data = await res.json();
				if (messages === null) {
					return;
				}
				setMessages([...messages, ...processSeverMessages([data])]);
			}
		},
		onError: () => {
			showNotification("Error", "Some error occured", "error");
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
				user: user,
				url: "/chat/feedback",
				method: "POST",
				body: {
					feedback_string: feedback,
					feedback: stars,
					chat_id: chatId,
				},
			});
		},
		onSuccess: async (res) => {
			if (res.ok) {
				const data = await res.json();
				if (messages === null) {
					return;
				}
				const updatedMessages = [...messages];
				updatedMessages.forEach((m) => {
					if (m.payload && (m.payload as any).chatId === data.chat_id) {
						(m.payload as any).rating = data.feedback as number;
					}
				});
				setMessages(updatedMessages);
				setFeedback("");
				setRatingValue(0);
				ratingModal[1].close();
			}
		},
		onError: () => {
			showNotification("Error", "Some error occured", "error");
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
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3,
				}}
				opened={ratingModal[0]}
				onClose={() => {
					ratingModal[1].close();
					setRateId(null);
					setRatingValue(0);
				}}
				title="Rate the Response"
				centered
			>
				<Stack>
					<Stack className="items-center">
						<Textarea
							value={feedback}
							onChange={(e) => setFeedback(e.currentTarget.value)}
							w={300}
							autosize
							minRows={3}
							maxRows={6}
							placeholder="Enter your feedback"
						/>
						<div
							style={{
								direction: "ltr",
								fontFamily: "sans-serif",
								touchAction: "none",
							}}
						>
							<Rating
								onClick={(rate) => setRatingValue(rate)}
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
					</Stack>
					<Button
						onClick={() => {
							rateMutation.mutate({
								stars: ratingValue,
								chatId: rateId as string,
							});
						}}
						loading={rateMutation.isLoading}
					>
						Submit Rating
					</Button>
				</Stack>
			</Modal>
			<Modal
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3,
				}}
				opened={specialModal[0]}
				onClose={() => {
					specialModal[1].close();
				}}
				title="Voice to text"
				centered
			>
				<SpecialInputs
					setCurrentInput={setCurrentInput}
					user={user}
					closeModal={specialModal[1].close}
				/>
			</Modal>
			<Center className="h-screen w-screen bg-gray-100">
				<div className=" h-full w-full">
					<MainContainer>
						<ChatContainer>
							<MessageList autoScrollToBottomOnMount={true}>
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
																ratingModal[1].open();
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
										className="h-[unset] bg-transparent"
										content="Bot is typing"
									/>
								)}
							</MessageList>
							<MessageInput
								onSend={(message) => {
									setCurrentInput("");
									if (messages === null) {
										setMessages([makeNewMessage(message)]);
									} else {
										setMessages([
											...messages,
											makeNewMessage(message),
										]);
									}
									sendMessageMutation.mutate({
										text: message,
									});
								}}
								attachButton={false}
								value={currentInput}
								onChange={(m) => setCurrentInput(m)}
								onAttachClick={() => specialModal[1].open()}
								placeholder="Ask me anything..."
							/>
							<InputToolbox>
								<Button
									onClick={() => {
										specialModal[1].open();
									}}
									radius="xl"
									rightSection={<IconMicrophone size={18} />}
								>
									Use Voice
								</Button>
							</InputToolbox>
						</ChatContainer>
					</MainContainer>
				</div>
			</Center>
		</>
	);
};

export default Chat;
