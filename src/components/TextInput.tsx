import {useController, UseControllerProps, useFormContext} from "react-hook-form";
import {View} from "react-native";
import type {TextInputProps as RNTextInputProps} from "react-native";
import {Input as RNTextInput} from "react-native-elements";
import {moderateScale, scale, ScaledSheet} from "react-native-size-matters";

interface TextInputProps extends RNTextInputProps, UseControllerProps {
    label: string;
    defaultValue?: string;
}

/**
 * Controlled input component for react-hook-form
 */
const ControlledInput = (props: TextInputProps) => {
    const {
        name,
        label,
        rules,
        defaultValue,
        control,
        multiline = false,
        numberOfLines = 1,
        ...inputProps
    } = props;

    const { field, fieldState: { error } } = useController({ name, rules, defaultValue, control });

    // Define the input style based on the presence of an error
    const inputStyle = {
        // @ts-ignore
        ...styles.input,
        backgroundColor: error ? '#ffe6e6' : '#fff',
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <RNTextInput
                    label={label}
                    inputStyle={[inputStyle, multiline && { height: numberOfLines * 20, borderWidth: 1, borderBottomWidth: 1 }]}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                    ref={field.ref}
                    errorMessage={error?.message}
                    {...inputProps}
                />
            </View>
        </View>
    );
};

/**
 * TextInput component that integrates with react-hook-form
 */
export const TextInput = (props: TextInputProps) => {
    const { name } = props;
    const { control } = useFormContext(); // Get control from form context

    if (!control || !name) {
        const msg = !control ? 'TextInput must be wrapped by the FormProvider' : 'Name must be defined';
        console.error(msg);
        return null;
    }

    return <ControlledInput {...props} control={control} />; // Pass control to ControlledInput
};

const styles = ScaledSheet.create({
    label: {
        color: '#000',
        margin: scale(14),
    },
    container: {
        flex: -1,
        justifyContent: 'center',
        padding: scale(8),
    },
    input: {
        height: scale(40),
        padding: scale(10),
        borderRadius: 4,
    },
    inputContainer: {
        margin: scale(2),
    },
    errorText: {
        color: '#f44336',
        marginTop: scale(4),
        fontSize: moderateScale(12, 0.4),
    },
});
