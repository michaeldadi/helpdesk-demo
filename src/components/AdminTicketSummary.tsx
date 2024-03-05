import React, { FC, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { scale, ScaledSheet } from "react-native-size-matters";
import { supabase } from "../utils/supabase";

const AdminTicketSummary: FC = () => {
    const [ticketCounts, setTicketCounts] = useState({
        new: 0,
        inProgress: 0,
        resolved: 0
    });

    const getTicketCounts = async (): Promise<void> => {
        try {
            const statuses = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
            const counts = await Promise.all(statuses.map(async (status) => {
                const { count, error } = await supabase
                    .from('tickets')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', status);
                if (error) throw error;
                return count;
            }));

            setTicketCounts({
                new: counts[0] ?? 0,
                inProgress: counts[1] ?? 0,
                resolved: counts[2] ?? 0
            });
        } catch (err) {
            console.error('Error fetching ticket counts:', err);
        }
    };

    useEffect(() => {
        getTicketCounts();
    }, []);

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
