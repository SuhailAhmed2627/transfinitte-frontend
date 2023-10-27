import { QueryClient } from "react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
			cacheTime: 0,
			staleTime: 0,
		},
	},
});

export { queryClient };
