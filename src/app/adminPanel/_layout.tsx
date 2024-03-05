import {Stack} from "expo-router";

const AppLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{title: 'Admin Panel'}} />
            <Stack.Screen name="ticket" options={{title: 'Ticket Details'}} />
        </Stack>
    )
};

export default AppLayout;
