import React, {FC} from "react";
import {View} from "react-native";
import {ScaledSheet} from "react-native-size-matters";

const HorizontalDivider: FC = () => {
    return <View style={styles.divider} />
};

const styles = ScaledSheet.create({
    divider: {
        marginHorizontal: '10@s',
        backgroundColor: '#000',
        height: '1@s',
    },
});

export default HorizontalDivider;
