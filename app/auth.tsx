import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native"
import { Button, Text, TextInput, useTheme } from "react-native-paper"
import { useRouter } from "expo-router";
export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const theme = useTheme();

    const {signUp,signIn} = useAuth();
 
    const router = useRouter();
    const handleAuth = async () => {
        // Handle authentication logic here
        if(!email || !password) {
            setError("Please enter email and password");
            return;
        }
        
        if(password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setError(null);

        if (isSignUp){
          const error =  await signUp(email,password);
          if (error) {
            setError(error);
            return;
          }

        }else{
            const error = await signIn(email,password);
            if (error) {
                setError(error);
                return;
            }
            router.replace("/");

        }

    };
    const handleSwitchMode = () => {
        setIsSignUp((prev) => !prev);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.formContainer}>
                <Text variant="headlineMedium" style={styles.title}>
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </Text>
                
                <TextInput 
                    label="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    mode="outlined"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                
                <TextInput 
                    label="Password"
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    right={
                        <TextInput.Icon 
                            icon={showPassword ? "eye-off" : "eye"} 
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    }
                />

                {error && <Text style={{color:theme.colors.error, textAlign: 'center'}}>{error}</Text>}
                
                <Button 
                    mode="contained" 
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    onPress={handleAuth}
                >
                    {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                
                <Button 
                    mode="text" 
                    onPress={handleSwitchMode}
                    style={styles.secondaryButton}
                >
                    {isSignUp ? "Already have an account? Sign in" : 
                    "Don't have an account? Sign up"}
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    title: {
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 16,
    },
    primaryButton: {
        marginTop: 24,
        marginBottom: 16,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    secondaryButton: {
        marginTop: 8,
    },
});
