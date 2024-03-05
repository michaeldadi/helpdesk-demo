import {Ticket, TicketStatus} from "../types";
import {View, Text, Pressable} from "react-native";
import {scale, ScaledSheet} from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment";
import {Link} from "expo-router";
import {convertStatusToDisplayString} from "../utils/helpers";

const AdminTicketListItem = ({ticket} : {ticket: Ticket}) => {
    return (
        <Link
            href={{
                pathname: '/adminPanel/ticket/[id]',
                params: {id: ticket.id}
            }}
            asChild
        >
            <Pressable style={styles.container}>
                <View style={styles.row}>
                    <View style={styles.rowContainer}>
                        <View style={styles.profileImageContainer}>
                            <Ionicons name={'person'} size={scale(30)} color={'#6cacf4'} />
                        </View>
                        <View>
                            <Text>{ticket.name}</Text>
                            <Text>{ticket.email}</Text>
                        </View>
                    </View>
                    <Text>{moment(ticket.created_at).fromNow()}</Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text>{ticket.description}</Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.statusContainer}>
                        <Ionicons name={'checkmark'} size={scale(20)} color={'#6cacf4'} />
                        <Text>{`Status: ${convertStatusToDisplayString(ticket.status as TicketStatus)}`}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name={'chatbubbles'} size={scale(20)} color={'#6cacf4'} />
                        <Text style={styles.commentsContainer}>1</Text>
                    </View>
                </View>
            </Pressable>
        </Link>
    )
};

const styles = ScaledSheet.create({
    container: {
        display: 'flex',
        margin: scale(8),
        backgroundColor: '#fff',
        padding: scale(12),
        borderRadius: scale(10),
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileImageContainer: {
        borderRadius: scale(12),
        backgroundColor: '#aab4bc',
        padding: scale(10),
        marginRight: scale(8),
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    descriptionContainer: {
        marginVertical: scale(16),
    },
    statusContainer: {
        backgroundColor: '#aab4bc',
        padding: scale(8),
        borderRadius: scale(10),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    commentsContainer: {
        marginLeft: scale(8),
    },
});

export default AdminTicketListItem;
