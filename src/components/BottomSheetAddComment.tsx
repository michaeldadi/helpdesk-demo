import React, {FC, useCallback, useMemo, useState} from "react";
import {Keyboard, Text} from "react-native";
import {moderateScale, scale, ScaledSheet} from "react-native-size-matters";
import BottomSheet, {BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import {Button} from "react-native-elements";
import {BottomSheetProps} from "../types";
import {supabase} from "../utils/supabase";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

const BottomSheetAddComment: FC<BottomSheetProps> = ({sheetRef, ticketId, onSuccess}) => {
    const snapPoints = useMemo(() => ['45%'], []);

    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                enableTouchThrough={false}
                pressBehavior={"close"}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                onPress={() => Keyboard.dismiss()}
                {...props}
            />
        ),
        []
    );

    const addNewComment = async () => {
        setLoading(true);

        const {data, error} = await supabase.from('comments').insert({
            ticket_id: ticketId,
            author_name: 'Support Agent',
            author_email: 'support@getzealthy.com',
            content: comment,
        })
            .select()
            .single();

        console.log('Would normally send email here with body: ...');

        setLoading(false);

        onSuccess && onSuccess(data);

        setComment('');
        Keyboard.dismiss();
        sheetRef.current?.close();
        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
        )
        Toast.show({ type: 'success', text1: 'Comment added successfully' });
    }

    return (
        <BottomSheet ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} backdropComponent={renderBackdrop}>
            <BottomSheetView style={styles.container}>
                <Text style={styles.textAddComment}>Add Comment</Text>

                <BottomSheetTextInput
                    placeholder={'Enter comment...'}
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                    style={styles.inputStyle}
                />

                <Button style={styles.btnAddComment} title={'Add Comment'} loading={loading} onPress={addNewComment} />
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = ScaledSheet.create({
    container: {
        padding: scale(12),
        display: 'flex',
    },
    textAddComment: {
        fontSize: moderateScale(20, 0.4),
        fontWeight: 'bold',
    },
    btnAddComment: {
        marginTop: 'auto',
    },
    inputStyle: {
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#aab4bc',
        minHeight: scale(100),
        marginVertical: scale(24),
        backgroundColor: '#fff',
        padding: scale(12),
    },
});

export default BottomSheetAddComment;
