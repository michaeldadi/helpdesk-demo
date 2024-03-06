import React from 'react';
import { Tabs } from 'expo-router/tabs';
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import Toast from "react-native-toast-message";
import {GestureHandlerRootView} from "react-native-gesture-handler";

// Root tab navigator layout
const AppLayout = () => {
    return (
        <ActionSheetProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                    <>
                        <Tabs>
                            <Tabs.Screen
                                name="index"
                                options={{title: 'Customer Panel', href: '/'}}
                            />
                            <Tabs.Screen
                                name="adminPanel"
                                options={{title: 'Admin Panel', href: '/adminPanel', headerShown: false}}
                            />
                        </Tabs>
                        <Toast topOffset={60} />
                    </>
            </GestureHandlerRootView>
        </ActionSheetProvider>
    );
};

export default AppLayout;
