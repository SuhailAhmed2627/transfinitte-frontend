import { Button, Select, Stack, Tabs, rem } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
// @ts-ignore
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import { useState } from "react";
import { dataFetch, showNotification } from "../../utils/helpers";
import { User } from "../../type";
import { useMutation } from "react-query";

const SpecialInputs = ({
	user,
	setCurrentInput,
	closeModal,
}: {
	user: User;
	setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
	closeModal: () => void;
}) => {
	const iconStyle = { width: rem(12), height: rem(12) };
	const [recordState, setRecordState] = useState<RecordState>(
		RecordState.NONE
	);
	const [language, setLanguage] = useState<string>("english");

	const uploadAudio = useMutation({
		mutationKey: "uploadAudio",
		mutationFn: async ({
			audioData,
			language,
		}: {
			audioData: any;
			language: string;
		}) => {
			console.log(audioData);

			const file = new File([audioData.blob], "audio", {
				type: audioData.type,
			});

			const data = new FormData();
			data.append("audioFile", file);
			data.append("language", language);

			return await dataFetch({
				url: "/input/audio",
				user: user,
				body: data,
			});
		},
		onSuccess: async (res) => {
			if (!res.ok) {
				showNotification("Error", "Some error occured", "error");
				setRecordState(RecordState.NONE);
				setLanguage("english");
				return;
			}
			const data = await res.json();
			closeModal();
			setCurrentInput(data.text);
		},
		onError: () => {
			console.log("error");
		},
	});

	const start = () => {
		setRecordState(RecordState.START);
	};
	const stop = () => {
		setRecordState(RecordState.STOP);
	};

	const onStop = (audioData: any, language: string) => {
		uploadAudio.mutate({ audioData, language });
		setRecordState(RecordState.NONE);
	};

	return (
		<Tabs defaultValue="translate">
			<Tabs.List>
				<Tabs.Tab
					value="translate"
					leftSection={<IconPhoto style={iconStyle} />}
				>
					Translate
				</Tabs.Tab>
				<Tabs.Tab
					value="voice"
					leftSection={<IconPhoto style={iconStyle} />}
				>
					Voice
				</Tabs.Tab>
			</Tabs.List>
			<Tabs.Panel value="translate">Translate</Tabs.Panel>
			<Tabs.Panel value="voice">
				<Stack className=" items-center">
					{
						<AudioReactRecorder
							canvasWidth={300}
							state={recordState}
							onStop={onStop}
						/>
					}
					<Select
						w={300}
						label="Select Language"
						placeholder=""
						data={[
							{
								value: "english",
								label: "English",
							},
							{
								value: "tamil",
								label: "Tamil",
							},
							{
								value: "hindi",
								label: "Hindi",
							},
						]}
						value={language}
						onChange={(value) => setLanguage(value as string)}
					/>

					{recordState === RecordState.NONE && (
						<Button w={300} onClick={start}>
							Start
						</Button>
					)}
					{recordState === RecordState.START && (
						<Button w={300} onClick={stop}>
							Stop
						</Button>
					)}
				</Stack>
			</Tabs.Panel>
		</Tabs>
	);
};

export default SpecialInputs;
