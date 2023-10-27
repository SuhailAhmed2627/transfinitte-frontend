import { Center } from "@mantine/core";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
	return (
		<Center className="h-full w-full error-bg flex-col">
			<h1 className="font-heading error-shadow font-thin text-[18rem]">
				404
			</h1>
			<Link
				className=" underline font-heading text-xl transition-all hover:tracking-wider"
				to="/"
			>
				Lost? Click here to get back
			</Link>
		</Center>
	);
};

export default NotFoundPage;
