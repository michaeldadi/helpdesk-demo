import {Stack} from "expo-router";

// Stack navigator layout for admin dashboard
const AppLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{title: 'Admin Panel'}} />
            <Stack.Screen name="ticket" options={{title: 'Ticket Details'}} />
        </Stack>
    )
};

export default AppLayout;
