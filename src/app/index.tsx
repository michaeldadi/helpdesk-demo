import React, {FC, useCallback, useState} from 'react';
import {ScaledSheet, scale, moderateScale} from 'react-native-size-matters';
import {FlatList, Text, View} from "react-native";
import {useFocusEffect} from "expo-router";
import type {Ticket} from "../types";
import {supabase} from "../utils/supabase";
import CustomerTicketListItem from "../components/CustomerTicketListItem";
import HorizontalDivider from "../components/HorizontalDivider";
import {Button} from "react-native-elements";
import ModalCreateTicket from "../components/ModalCreateTicket";

const CustomerTicketsEntry: FC = () => {
    // Total number of active tickets
    const [activeTicketCount, setActiveTicketCount] = useState<number>(0);
    // Ticket list items
    const [tickets, setTickets] = useState<(Ticket & { commentCount: number })[]>([]);
    // List fetching state
    const [isFetching, setIsFetching] = useState<boolean>(false);
    // List filter for ticket status
    const [filter, setFilter] = useState<null | 'NEW' | 'IN_PROGRESS'>(null);

    // Create ticket modal - visibility prop
    const [createTicketModalVisible, setCreateTicketModalVisible] = useState<boolean>(false);

    // Get total number of active tickets
    const getActiveTicketCount = async (): Promise<number | null> => {
        try {
            const {count, error} = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .in('status', ['NEW', 'IN_PROGRESS'])
                .order('created_at', { ascending: false });

            return count;
        } catch (err) {
            console.error('Error fetching active ticket count:', err);
            return 0;
        }
    };

    // Get all tickets with status of 'NEW' or 'IN_PROGRESS'
    const getActiveTickets = async (): Promise<(Ticket & { commentCount: number })[] | null> => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*, comments:comments(ticket_id)')
                .in('status', ['NEW', 'IN_PROGRESS'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map the tickets to include the count of comments
            return data.map(ticket => ({
                ...ticket,
                commentCount: ticket.comments?.length || 0
            }));
        } catch (err) {
            console.error('Error fetching active tickets:', err);
            return null;
        }
    };

    // Load active tickets into list
    const loadTickets = async (): Promise<void> => {
        setIsFetching(true);

        const fetchedTickets = await getActiveTickets();
        setTickets(fetchedTickets ?? []);

        setIsFetching(false);
    };

    // Fetch active tickets when screen is focused
    useFocusEffect(useCallback(() => {
        getActiveTicketCount().then((count: number | null) => setActiveTicketCount(count ?? 0));
        loadTickets();
    }, [filter]));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Active Tickets</Text>
            <HorizontalDivider />

            <View style={styles.ticketActionsContainer}>
                <Text style={styles.ticketCount}>{activeTicketCount} total</Text>

                <Button
                    title="New Ticket"
                    icon={{name: 'add', color: 'white'}}
                    onPress={() => setCreateTicketModalVisible(true)}
                    raised
                    buttonStyle={styles.btnNewTicket}
                />
            </View>

            <FlatList
                style={{height: '75%'}}
                refreshing={isFetching}
                onRefresh={loadTickets}
                data={tickets}
                renderItem={({ item }: { item: Ticket & { commentCount: number } }) => <CustomerTicketListItem ticket={item} commentCount={item.commentCount} />}
            />

            <ModalCreateTicket visible={createTicketModalVisible} setVisible={setCreateTicketModalVisible} />
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        display: 'flex',
    },
    title: {
        fontSize: moderateScale(30, 0.4),
        margin: scale(28),
        fontWeight: 'bold',
    },
    ticketActionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: scale(12),
    },
    ticketCount: {
        fontSize: moderateScale(18, 0.4),
    },
    btnNewTicket: {
        padding: scale(8),
    },
    filtersContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

export default CustomerTicketsEntry;
