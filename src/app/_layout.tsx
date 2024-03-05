import React from 'react';
import { Tabs } from 'expo-router/tabs';
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import Toast from "react-native-toast-message";
import {HoldMenuProvider} from "react-native-hold-menu";
import {GestureHandlerRootView} from "react-native-gesture-handler";

const AppLayout = () => {
    return (
        <ActionSheetProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                {/* @ts-ignore */}
                <HoldMenuProvider theme="light">
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
                </HoldMenuProvider>
            </GestureHandlerRootView>
        </ActionSheetProvider>
    );
};

export default AppLayout;
