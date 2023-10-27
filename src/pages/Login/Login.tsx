import {
	TextInput,
	PasswordInput,
	Checkbox,
	Anchor,
	Paper,
	Title,
	Text,
	Container,
	Group,
	Button,
} from "@mantine/core";
import { useState } from "react";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginSuccess } from "../../actions/user";
import { dataFetch, showNotification } from "../../utils/helpers";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const login = useMutation({
		mutationKey: "login",
		mutationFn: async () => {
			const response = await dataFetch({
				url: "/auth/login",
				method: "POST",
				body: { email, password },
			});
			const data = await response.json();
			if (!response.ok) {
				showNotification("Error", "Some error occured", "error");
				return;
			}
			dispatch(loginSuccess(data));
			navigate("/chat");
			showNotification("Success", "Logged in successfully", "success");
		},
	});
	return (
		<Container
			className="h-full flex flex-col items-center justify-center"
			size={520}
		>
			<Title ta="center">Welcome!</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Do not have an account yet?{" "}
				<Anchor to={"/signup"} size="sm" component={Link}>
					Create account
				</Anchor>
			</Text>
			<Paper withBorder shadow="md" w={350} p={30} mt={30} radius="md">
				<TextInput
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					label="Email"
					required
				/>
				<PasswordInput
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					label="Password"
					required
					mt="md"
				/>
				<Button
					loading={login.isLoading}
					disabled={login.isLoading || !email || !password}
					onClick={() => login.mutate()}
					fullWidth
					mt="xl"
				>
					Log in
				</Button>
			</Paper>
		</Container>
	);
};

export default Login;
