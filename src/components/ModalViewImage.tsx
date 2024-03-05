import {Dispatch, FC, SetStateAction} from "react";
import {Modal} from "react-native";
import ImageViewer from 'react-native-image-zoom-viewer';

type ModalViewImageProps = {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    imageUrl: string;
};

const ModalViewImage: FC<ModalViewImageProps> = ({visible, setVisible, imageUrl}) => {
    return (
        <Modal visible={visible} animationType={'fade'} onRequestClose={() => setVisible(false)} transparent>
            {/* Image view */}
            <ImageViewer imageUrls={[{url: imageUrl}]} enableSwipeDown onSwipeDown={() => setVisible(false)} enablePreload />
        </Modal>
    );
};

export default ModalViewImage;
