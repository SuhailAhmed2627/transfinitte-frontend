import {
	Container,
	Title,
	Anchor,
	Paper,
	TextInput,
	PasswordInput,
	Button,
	Text,
} from "@mantine/core";
import { useState } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { dataFetch, showNotification } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { signUpSuccess } from "../../actions/user";

const Signup = () => {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const signUp = useMutation({
		mutationKey: "signUp",
		mutationFn: async () => {
			const response = await dataFetch({
				url: "/auth/register",
				method: "POST",
				body: { email, name, password },
			});
			const data = await response.json();
			if (!response.ok) {
				showNotification("Error", "Some error occured", "error");
				return;
			}
			dispatch(signUpSuccess(data));
			navigate("/chat");
			showNotification("Success", "Account created successfully", "success");
		},
	});

	return (
		<Container
			className="h-full flex flex-col items-center justify-center"
			size={520}
		>
			<Title ta="center">Welcome!</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Already have an account,{" "}
				<Anchor to={"/login"} size="sm" component={Link}>
					Login
				</Anchor>
			</Text>
			<Paper withBorder shadow="md" w={350} p={30} mt={30} radius="md">
				<TextInput
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					label="Email"
					placeholder="you@mantine.dev"
					required
				/>
				<TextInput
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
					label="Name"
					placeholder="Your Name"
					required
					mt="md"
				/>
				<PasswordInput
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					label="Password"
					placeholder="Your password"
					required
					mt="md"
				/>
				<Button
					loading={signUp.isLoading}
					disabled={signUp.isLoading || !email || !password || !name}
					onClick={() => signUp.mutate()}
					fullWidth
					mt="xl"
				>
					Sign Up
				</Button>
			</Paper>
		</Container>
	);
};

export default Signup;
