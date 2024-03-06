import React, {Dispatch, FC, SetStateAction, useState} from "react";
import {Modal, Text, TouchableOpacity, View} from "react-native";
import {ScaledSheet, scale} from "react-native-size-matters";
import Ionicons from '@expo/vector-icons/Ionicons';
import {FormProvider, SubmitErrorHandler, SubmitHandler, useForm} from "react-hook-form";
import {TextInput} from "./TextInput";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Button} from "react-native-elements";
import {useActionSheet} from "@expo/react-native-action-sheet";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {uploadFile} from "../utils/helpers";
import {FileMeta} from "../types";
import FileAttachmentListItem from "./FileAttachmentListItem";
import {supabase} from "../utils/supabase";
import * as Haptics from 'expo-haptics';

type ModalCreateTicketProps = {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
};

type FormValues = {
    email: string;
    name: string;
    description: string;
    attachments?: any[];
};

/**
 * Renders a modal for creating a new ticket
 */
const ModalCreateTicket: FC<ModalCreateTicketProps> = ({visible, setVisible}) => {
    const {...methods} = useForm<FormValues>();
    const {setFocus, reset} = methods;

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setLoading(true);
        // Insert the ticket into the 'tickets' table
        const { data: ticketData, error: insertError } = await supabase
            .from('tickets')
            .insert({
                name: data.name,
                email: data.email,
                description: data.description,
                status: 'NEW',
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting ticket:', insertError);
            Toast.show({ type: 'error', text1: 'Ticket submission failed' });
            setLoading(false);
            return;
        }

        // Get the inserted ticket's ID
        const ticketId = ticketData.id;

        // Insert each file attachment into the 'attachments' table
        for (const file of fileAttachments) {
            const { error: attachmentError } = await supabase
                .from('attachments')
                .insert({
                    ticket_id: ticketId,
                    file_url: file.file_url,
                    file_name: file.file_name,
                    file_size: file.file_size,
                    mime_type: file.mime_type,
                });

            if (attachmentError) {
                console.error('Error inserting attachment:', attachmentError);
                Toast.show({ type: 'error', text1: 'Attachment submission failed' });
                break;
            }
        }

        // Send email with new ticket details
        console.log('Would normally send email here with body: ...');

        setLoading(false);
        // Show success message and reset form
        Toast.show({ type: 'success', text1: 'Ticket submitted successfully' });
        reset();
        setVisible(false);
        setFileAttachments([]); // Clear the file attachments array
        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
        )
        Toast.show({ type: 'success', text1: 'Ticket submitted successfully' });
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        return console.log(errors)
    };

    // Email regex validation pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Handle closing the modal
    const handleCloseModal = () => {
        reset(); // Reset the form state and clear errors
        setVisible(false); // Close the modal
    };

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Take a photo with the device's camera
    const takePhoto = async () => {
        // Check if camera permissions are granted
        const permissionResponse = await ImagePicker.getCameraPermissionsAsync();

        // If camera permissions are not granted, request them
        if (!permissionResponse.granted) {
            const newPermissionResponse = await ImagePicker.requestCameraPermissionsAsync();
            if (!newPermissionResponse.granted) {
                return;
            }
        }

        // Launch the camera and get the result
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // If the user selected an image, upload it and show loading state
        if (!result.canceled) {
            setIsUploading(true);
            const uploadedFile = await uploadFile(result.assets[0].uri);

            const newFileMeta: FileMeta = {
                file_name: uploadedFile.path.split('/').pop(),
                file_size: result.assets[0].fileSize!,
                mime_type: result.assets[0].mimeType!,
                uri: result.assets[0].uri,
                id: uploadedFile.id,
                path: uploadedFile.path,
                file_url: uploadedFile.publicUrl,
            }

            setFileAttachments([...fileAttachments, newFileMeta]);
            setIsUploading(false);
        }
    };

    // Pick an image from the camera roll
    const pickImage = async () => {
        // Launch the image picker and get the result
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // If the user selected an image, upload it and show loading state
        if (!result.canceled) {
            setIsUploading(true);
            const uploadedFile = await uploadFile(result.assets[0].uri);

            const newFileMeta: FileMeta = {
                file_name: uploadedFile.path.split('/').pop(),
                file_size: result.assets[0].fileSize!,
                mime_type: result.assets[0].mimeType!,
                uri: result.assets[0].uri,
                id: uploadedFile.id,
                path: uploadedFile.path,
                file_url: uploadedFile.publicUrl,
            }

            setFileAttachments([...fileAttachments, newFileMeta]);
            setIsUploading(false);
        }
    };

    // Pick a document from the device
    const pickDocument = async () => {
        // Launch the document picker and get the result
        // For time's sake, only allow PDF files
        let result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        // If the user selected a file, upload it and show loading state
        if (!result.canceled) {
            setIsUploading(true);
            const uploadedFile = await uploadFile(result.assets[0].uri);

            const newFileMeta: FileMeta = {
                file_name: result.assets[0].name,
                file_size: result.assets[0].size!,
                mime_type: result.assets[0].mimeType!,
                uri: result.assets[0].uri,
                id: uploadedFile.id,
                path: uploadedFile.path,
                file_url: uploadedFile.publicUrl,
            };

            setFileAttachments([...fileAttachments, newFileMeta]);
            setIsUploading(false);
        }
    }

    // Action sheet for file upload options
    const { showActionSheetWithOptions } = useActionSheet();

    // Display file upload options via action sheet
    const displayFileUploadOptions = () => {
        const options = ['Take Photo', 'Choose from Library', 'Choose from Documents', 'Cancel'];
        const cancelButtonIndex = 3;

        showActionSheetWithOptions({
            options,
            cancelButtonIndex,
        }, (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    // Take a photo
                    takePhoto();
                    break;
                case 1:
                    // Choose image from library
                    pickImage();
                    break;
                case 2:
                    // Choose document from device
                    pickDocument();
                    break;
                case cancelButtonIndex:
                    // Canceled, do nothing
                    break;
                default:
                    // All other cases
                    break;
            }});
    };

    const [fileAttachments, setFileAttachments] = useState<FileMeta[]>([]);

    const removeFileFromAttachments = (file: any) => {
        fileAttachments.splice(fileAttachments.indexOf(file), 1);
        setFileAttachments([...fileAttachments]);
    }

    return (
        <Modal visible={visible} animationType="slide" style={styles.modalContainer}>
            <View style={styles.container}>
                <View style={styles.modalActionsContainer}>
                    <TouchableOpacity onPress={handleCloseModal}>
                        <Ionicons name={'close'} size={scale(30)} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Submit a Ticket</Text>
                <Text>Fill out the form below to create a new ticket.</Text>

                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardOpeningTime={0}
                    enableOnAndroid={true}
                    keyboardShouldPersistTaps='handled'
                >
                    <FormProvider {...methods}>
                        <TextInput
                            label={'Name'}
                            name={'name'}
                            placeholder={'Ex. John Doe'}
                            keyboardType={'default'}
                            autoCapitalize={'words'}
                            returnKeyType={'next'}
                            onSubmitEditing={() => setFocus('email')}
                            rules={{required: 'Name is required'}}
                        />
                        <TextInput
                            label={'Email Address'}
                            name={'email'}
                            placeholder={'Ex. jdoe@example.com'}
                            keyboardType={'email-address'}
                            returnKeyType={'next'}
                            onSubmitEditing={() => setFocus('description')}
                            rules={{required: 'Email is required', pattern: {value: emailRegex, message: 'Invalid email address'}}}
                        />
                        <TextInput
                            label={'Description'}
                            name={'description'}
                            placeholder={'Describe your issue here...'}
                            keyboardType={'default'}
                            returnKeyType={'next'}
                            autoCapitalize={'sentences'}
                            rules={{required: 'Description is required'}}
                            multiline={true}
                            numberOfLines={4}
                        />

                        <Button title={'Upload File(s)'} onPress={displayFileUploadOptions} type={'outline'} loading={isUploading} disabled={isUploading || loading} />

                        <View>
                            {fileAttachments.map((file: FileMeta) => (
                                <FileAttachmentListItem file={file} key={file.id} onRemoveFile={removeFileFromAttachments} />
                            ))}
                        </View>
                    </FormProvider>
                </KeyboardAwareScrollView>

                <Button title={'Submit Ticket'} onPress={methods.handleSubmit(onSubmit, onError)} style={styles.btnSubmit} loading={loading} disabled={loading || isUploading} />
            </View>

            <Toast topOffset={60} />
        </Modal>
    );
};

const styles = ScaledSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        flex: 1,
        padding: scale(22),
        marginTop: scale(45),
    },
    modalActionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    title: {
        marginTop: scale(18),
    },
    scrollContainer: {
        flexGrow: 1,
    },
    btnSubmit: {
        marginTop: 'auto',
        marginBottom: scale(40),
    },
});

export default ModalCreateTicket;
