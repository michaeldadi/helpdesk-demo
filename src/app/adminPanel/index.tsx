import React, {FC, useCallback, useState} from 'react';
import {scale, ScaledSheet} from "react-native-size-matters";
import {FlatList, Text, View} from "react-native";
import {Ticket, TicketStatus} from "../../types";
import {supabase} from "../../utils/supabase";
import AdminTicketSummary from "../../components/AdminTicketSummary";
import {Chip} from "react-native-elements";
import AdminTicketListItem from "../../components/AdminTicketListItem";
import {useFocusEffect} from 'expo-router';

const AdminPanel: FC = () => {
    // Ticket counts for admin ticket summary component
    const [ticketCounts, setTicketCounts] = useState({
        new: 0,
        inProgress: 0,
        resolved: 0
    });

    // Fetch ticket counts from the database
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

    // Ticket list items
    const [tickets, setTickets] = useState<(Ticket & { commentCount: number })[]>([]);
    // List filter for ticket status
    const [filter, setFilter] = useState<null | 'NEW' | 'IN_PROGRESS' | 'RESOLVED'>(null);

    const filterOptions : {label: string, value: TicketStatus | null}[] = [
        {label: 'All Tickets', value: null},
        {label: 'New', value: TicketStatus.NEW},
        {label: 'In Progress', value: TicketStatus.IN_PROGRESS},
        {label: 'Resolved', value: TicketStatus.RESOLVED}
    ];

    const [isFetching, setIsFetching] = useState<boolean>(false);

    // Fetch tickets based on the selected filter
    const fetchTickets = async () => {
        try {
            let query = supabase
                .from('tickets')
                .select('*, comments:comments(ticket_id)')
                .order('created_at', { ascending: false });

            if (filter) {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Map the tickets to include the count of comments
            return data.map(ticket => ({
                ...ticket,
                commentCount: ticket.comments?.length || 0
            }));
        } catch (err) {
            console.error('Error fetching tickets:', err);
        }
    };

    // Load fetched tickets into state
    const loadTickets = async (): Promise<void> => {
        setIsFetching(true);

        const fetchedTickets = await fetchTickets();
        setTickets(fetchedTickets ?? []);

        setIsFetching(false);
    };

    // Fetch ticket counts and tickets
    const loadTicketsAndCount = async (): Promise<void> => {
        await Promise.all([getTicketCounts(), loadTickets()]);
    };

    // Fetch tickets when the screen is focused or the filter changes
    useFocusEffect(useCallback(() => {
        loadTicketsAndCount();
    }, [filter]));

    return (
        <View style={styles.container}>
            <AdminTicketSummary ticketCounts={ticketCounts} />

            <View>
                <Text>Tickets</Text>
                <View style={styles.filterActionsContainer}>
                    {filterOptions.map((option, index) => (
                        <Chip
                            key={index}
                            title={option.label}
                            onPress={() => setFilter(option.value)}
                            type={filter === option.value ? 'solid' : 'outline'}
                        />
                    ))}
                </View>
            </View>

            <View>
                <FlatList
                    style={{ height: '79.5%' }}
                    refreshing={isFetching}
                    onRefresh={loadTicketsAndCount}
                    data={tickets}
                    renderItem={({ item }: { item: Ticket & { commentCount: number } }) => (
                        <AdminTicketListItem ticket={item} commentCount={item.commentCount} />
                    )}
                />
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        display: 'flex',
        padding: scale(12),
    },
    filterActionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginVertical: scale(8),
    },
});

export default AdminPanel;
