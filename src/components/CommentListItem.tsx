import {FC} from "react";
import {scale, ScaledSheet} from "react-native-size-matters";
import {View, Text} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment";
import {Comment} from "../types";

type CommentListItemProps = {
    comment: Comment;
}

const CommentListItem: FC<CommentListItemProps> = ({comment} : {comment: any}) => {
    return (
        <View style={styles.container}>
            <View style={styles.rowTop}>
                <View style={styles.rowTop}>
                    <View style={styles.profileImageContainer}>
                        <Ionicons name={'person'} size={scale(30)} color={'#6cacf4'} />
                    </View>
                    <View>
                        <Text>{comment?.author_name}</Text>
                        <Text>{comment?.author_email}</Text>
                    </View>
                </View>
                <Text>{moment(comment?.created_at).fromNow()}</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text>{comment?.content}</Text>
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        padding: scale(12),
        backgroundColor: '#fff',
        marginVertical: scale(16),
        borderRadius: scale(10),
    },
    rowTop: {
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    profileImageContainer: {
        borderRadius: scale(12),
        backgroundColor: '#aab4bc',
        padding: scale(10),
        marginRight: scale(8),
    },
    contentContainer: {
        marginTop: scale(22),
    },
});

export default CommentListItem;
