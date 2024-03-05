import {TouchableOpacity, View, Text, Pressable} from "react-native";
import {scale, ScaledSheet} from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";
import {convertBytesToMB, downloadAndShareFile} from "../utils/helpers";
import ModalViewImage from "./ModalViewImage";
import {useState} from "react";

const FileAttachmentListItem = ({ file, onRemoveFile }: { file: any, onRemoveFile?: (file: any) => void }) => {
    const [modalViewImageVisible, setModalViewImageVisible] = useState(false);

    return (
        <Pressable onPress={() => file.mime_type === 'application/pdf' ? downloadAndShareFile(file.file_url) : setModalViewImageVisible(true)} style={styles.container}>
            <View style={styles.innerFileContainer}>
                <Ionicons name={'document'} size={scale(28)} color={'#6cacf4'} />
                <View style={styles.fileMetaColumnContainer}>
                    <Text>{file.file_name}</Text>
                    <Text>{convertBytesToMB(file.file_size)}</Text>
                </View>
            </View>

            {onRemoveFile && (
                <TouchableOpacity onPress={onRemoveFile}>
                    <Ionicons name={'close'} size={scale(22)}/>
                </TouchableOpacity>
            )}

            <ModalViewImage visible={modalViewImageVisible} setVisible={setModalViewImageVisible} imageUrl={file.file_url} />
        </Pressable>
    )
};

const styles = ScaledSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: scale(10),
        backgroundColor: '#aab4bc',
        padding: scale(8),
        margin: scale(8),
    },
    innerFileContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fileMetaColumnContainer: {
        marginLeft: scale(8),
    },
});

export default FileAttachmentListItem;
