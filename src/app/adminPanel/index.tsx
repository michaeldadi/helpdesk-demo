import React, {FC, useEffect, useState} from 'react';
import {scale, ScaledSheet} from "react-native-size-matters";
import {FlatList, Text, View} from "react-native";
import {useNavigation} from "expo-router";
import {Ticket, TicketStatus} from "../../types";
import {supabase} from "../../utils/supabase";
import AdminTicketSummary from "../../components/AdminTicketSummary";
import {Chip} from "react-native-elements";
import AdminTicketListItem from "../../components/AdminTicketListItem";

const AdminPanel: FC = () => {
    const navigation = useNavigation();
    const isFocused: boolean = navigation.isFocused();

    // Ticket list items
    const [tickets, setTickets] = useState<Ticket[]>([]);
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
                .select('*')
                .order('created_at', { ascending: false });

            if (filter) {
                query = query.in('status', [filter]);
            }

            const {data, error} = await query;

            if (error) throw error;

            return data;
        } catch (err) {
            console.error('Error fetching tickets:', err);
        }
    };

    const loadTickets = async (): Promise<void> => {
        setIsFetching(true);

        fetchTickets().then((data?: Ticket[] | null) => {
            setTickets(data ?? []);
        });

        setIsFetching(false);
    };

    // Fetch tickets when the screen is focused or the filter changes
    useEffect(() => {
        if (isFocused) {
            loadTickets();
        }
    }, [isFocused, filter]);

    return (
        <View style={styles.container}>
            <AdminTicketSummary />

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
                    style={{height: '79.5%'}}
                    refreshing={isFetching}
                    onRefresh={loadTickets}
                    data={tickets}
                    renderItem={({item}: {item: Ticket}) => <AdminTicketListItem ticket={item} />}
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
