import React, { FC, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { scale, ScaledSheet } from "react-native-size-matters";
import { supabase } from "../utils/supabase";

type AdminTicketSummaryProps = {
    ticketCounts: {
        new: number;
        inProgress: number;
        resolved: number;
    };
}

const AdminTicketSummary: FC<AdminTicketSummaryProps> = ({ticketCounts}) => {
    return (
        <View style={styles.container}>
            <View>
                <Text>New Tickets</Text>
                <Text>{ticketCounts.new}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View>
                <Text>In Progress</Text>
                <Text>{ticketCounts.inProgress}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View>
                <Text>Resolved Tickets</Text>
                <Text>{ticketCounts.resolved}</Text>
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        padding: scale(8),
        backgroundColor: '#fff',
        borderRadius: scale(10),
        margin: scale(8),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#aab4bc',
    },
});

export default AdminTicketSummary;
