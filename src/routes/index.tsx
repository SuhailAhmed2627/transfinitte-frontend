import { routes } from "./routes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "../pages";
import { MetaDecoratedPage } from "../components";

const Router = () => {
	return (
		<BrowserRouter>
			<Routes>
				{routes.map((route) => {
					return (
						<Route
							key={route.path}
							path={route.path}
							element={
								<MetaDecoratedPage
									title={route.title}
									description={route.description}
									element={route.element}
								/>
							}
						>
							{route.children}
						</Route>
					);
				})}
				<Route
					path="*"
					element={
						<MetaDecoratedPage
							title="Not Found"
							description="This is the not found page of App"
							element={<NotFoundPage />}
						/>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
};

export default Router;
