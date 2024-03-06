import {FC, useEffect, useLayoutEffect, useRef, useState} from "react";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {moderateScale, scale, ScaledSheet} from "react-native-size-matters";
import {Comment, FileAttachment, Ticket, TicketStatus} from "../../../types";
import {supabase} from "../../../utils/supabase";
import {useLocalSearchParams, useNavigation} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Chip} from "react-native-elements";
import {convertStatusToDisplayString} from "../../../utils/helpers";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetAddComment from "../../../components/BottomSheetAddComment";
import BottomSheetUpdateTicketStatus from "../../../components/BottomSheetUpdateTicketStatus";
import CommentListItem from "../../../components/CommentListItem";
import FileAttachmentListItem from "../../../components/FileAttachmentListItem";

/**
 * Renders ticket details, including comments and attachments
 */

const AdminTicketDetails: FC = () => {
    const {id} = useLocalSearchParams();

    // State for storing the ticket details, comments, and attachments
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[] | null>([]);
    const [attachments, setAttachments] = useState<FileAttachment[] | null>([]);

    // Access the navigation object for navigation and setting options
    const navigation = useNavigation();

    // Refs for the bottom sheets used to add comments and update the ticket status
    const bottomSheetRefAddComment = useRef<BottomSheet>(null);
    const bottomSheetRefUpdateStatus = useRef<BottomSheet>(null);

    // Set the header options for the screen, including buttons for adding comments and updating the ticket status
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.navigationHeaderContainer}>
                    <TouchableOpacity style={styles.navigationIconContainer} onPress={() => bottomSheetRefAddComment.current?.expand()}>
                        <Ionicons name={'chatbubble-outline'} size={scale(18)} color={'#6cacf4'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navigationIconContainer} onPress={() => bottomSheetRefUpdateStatus.current?.expand()}>
                        <Ionicons name={'flash-outline'} size={scale(18)} color={'#6cacf4'} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, []);

    // Fetch ticket details from database
    const fetchTicketDetails = async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select()
            .eq('id', id)
            .single();

        setTicket(data)
    }

    // Fetch ticket on component mount
    useEffect(() => {
        fetchTicketDetails();
    }, []);

    // Fetch comments related to the ticket from database
    const fetchComments = async () => {
        if (!ticket?.id) return;

        const { data, error } = await supabase
            .from('comments')
            .select()
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data);
        }
    };

    // Fetch attachments related to the ticket from database
    const fetchAttachments = async () => {
        if (!ticket?.id) return;

        const { data, error } = await supabase
            .from('attachments')
            .select()
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching attachments:', error);
        } else {
            setAttachments(data);
        }
    };

    // Fetch comments and attachments whenever ticket details are updated
    useEffect(() => {
        Promise.all([fetchComments(), fetchAttachments()]);
    }, [ticket]);

    return (
        <>
            <View style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.titleText}>Ticket Details</Text>

                    <Text>Overview</Text>

                    <Text style={styles.subheaderText}>Customer Information</Text>
                    <View style={styles.row}>
                        <View style={styles.profileImageContainer}>
                            <Ionicons name={'person'} size={scale(30)} color={'#6cacf4'} />
                        </View>
                        <View>
                            <Text style={styles.textCustomerName}>{ticket?.name}</Text>
                            <Text>{ticket?.email}</Text>
                        </View>
                    </View>

                    <Text style={styles.subheaderText}>Ticket Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.ticketNumberText}>{`Ticket #${ticket?.id}`}</Text>
                        <Chip title={convertStatusToDisplayString(ticket?.status as TicketStatus)} />
                    </View>

                    {attachments?.map(attachment => (
                        <FileAttachmentListItem key={attachment.id} file={attachment} />
                    ))}

                    <Text style={styles.subheaderText}>Ticket Description</Text>
                    <Text>{ticket?.description}</Text>

                    <Text style={styles.subheaderText}>Correspondence</Text>
                    {comments?.map((comment) => (
                        <CommentListItem key={comment.id} comment={comment} />
                    ))}
                </ScrollView>
            </View>

            {/* Bottom sheets for adding a comment and updating ticket status */}
            <BottomSheetAddComment sheetRef={bottomSheetRefAddComment} ticketId={ticket?.id} onSuccess={(newComment) => setComments((currentComments) => [newComment, ...(currentComments ?? [])])} />
            <BottomSheetUpdateTicketStatus sheetRef={bottomSheetRefUpdateStatus} ticketId={ticket?.id} ticketStatus={ticket?.status} onSuccess={val => setTicket({...ticket!, status: val})} />
        </>
    );
};

const styles = ScaledSheet.create({
    container: {
        flexGrow: 1,
        padding: scale(16),
    },
    titleText: {
        fontSize: moderateScale(24, 0.4),
        fontWeight: 'bold',
        marginBottom: scale(12),
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        padding: scale(12),
        marginVertical: scale(14),
        alignItems: 'center',
    },
    navigationHeaderContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: scale(75),
    },
    navigationIconContainer: {
        padding: scale(10),
    },
    profileImageContainer: {
        borderRadius: scale(12),
        backgroundColor: '#aab4bc',
        padding: scale(10),
        marginRight: scale(8),
    },
    textCustomerName: {
        fontSize: moderateScale(24, 0.4),
        fontWeight: 'bold',
    },
    subheaderText: {
        fontSize: moderateScale(18, 0.4),
        marginTop: scale(10),
    },
    ticketNumberText: {
        color: '#5b7fa7',
        fontWeight: 'bold',
        marginRight: scale(10),
    },
});

export default AdminTicketDetails;
