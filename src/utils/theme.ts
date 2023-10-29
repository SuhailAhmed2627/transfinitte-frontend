import { createTheme } from "@mantine/core";

const theme = createTheme({
	fontFamily: "Segoe UI, Roboto, sans-serif",
	components: {
		Button: {
			styles: {
				root: {
					background:
						"linear-gradient(130deg, #2870EA 20%, #1B4AEF 77.5%)",
				},
			},
		},
	},
});

export default theme;
