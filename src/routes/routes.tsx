import React from "react";
import "./types.d";
import { Landing, Signup, Login, Chat } from "../pages";

const SuspenseFallback = () => {
	return <div>Loading...</div>;
};

const LazyRouteElement = (props: { element: JSX.Element }) => {
	return (
		<React.Suspense fallback={<SuspenseFallback />}>
			{props.element}
		</React.Suspense>
	);
};

export const routes: RouteType[] = [
	{
		path: "/",
		element: <Landing />,
		title: "Welcome",
		description: "Landing Page of App",
	},
	{
		path: "/login",
		element: <Login />,
		title: "Login",
		description: "Login Page of App",
	},
	{
		path: "/signup",
		element: <Signup />,
		title: "Signup",
		description: "Signup Page of App",
	},
	{
		path: "/chat",
		element: <Chat />,
		title: "Chat",
		description: "Chat Page of App",
	},
];
