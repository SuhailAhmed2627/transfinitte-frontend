import { Button, Select, Stack, Tabs, rem } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
// @ts-ignore
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import { useState } from "react";
import { dataFetch, showNotification } from "../../utils/helpers";
import { User } from "../../type";
import { useMutation } from "react-query";
function blobToBase64(blob: Blob) {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}
const SpecialInputs = ({
	user,
	setCurrentInput,
	closeModal,
}: {
	user: User;
	setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
	closeModal: () => void;
}) => {
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
			const data = await blobToBase64(audioData.blob);
			return await dataFetch({
				user: user,
				method: "POST",
				url: "/input/voice",
				body: {
					lang: language,
					data: data,
				},
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
			if (data.query === null) {
				showNotification(
					"Oops!",
					"Try Again, Unable to recognize",
					"error"
				);
				setRecordState(RecordState.NONE);
				setLanguage("english");
				return;
			}
			closeModal();
			setCurrentInput(data.query);
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

	return (
		<Stack className=" items-center">
			<AudioReactRecorder
				canvasWidth={300}
				state={recordState}
				onStop={(audioData: any) => {
					uploadAudio.mutate({ audioData, language });
					setRecordState(RecordState.NONE);
				}}
			/>
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
				<Button loading={uploadAudio.isLoading} w={300} onClick={start}>
					Start
				</Button>
			)}
			{recordState === RecordState.START && (
				<Button loading={uploadAudio.isLoading} w={300} onClick={stop}>
					Stop
				</Button>
			)}
		</Stack>
	);
};

export default SpecialInputs;
