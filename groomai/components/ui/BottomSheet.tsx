import { useCallback, useRef } from 'react'
import { StyleSheet } from 'react-native'
import BottomSheetLib, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'

interface BottomSheetProps {
    children: React.ReactNode
    snapPoints?: (string | number)[]
    onClose?: () => void
}

export function BottomSheet({ children, snapPoints = ['50%'], onClose }: BottomSheetProps) {
    const ref = useRef<BottomSheetLib>(null)

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.6}
            />
        ),
        []
    )

    return (
        <BottomSheetLib
            ref={ref}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.background}
            handleIndicatorStyle={styles.handle}
        >
            <BottomSheetView style={styles.content}>
                {children}
            </BottomSheetView>
        </BottomSheetLib>
    )
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: Colors.bg.secondary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handle: {
        backgroundColor: Colors.text.tertiary,
        width: 36,
        height: 4,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
})
