import { useCallback } from 'react';
import { useTheme } from '@mui/material';

export default function useDownloadImage() {
    const theme = useTheme();
    return useCallback(
    async (ref: React.MutableRefObject<HTMLElement>) => {
            const backgroundColor = theme.palette.background.default;
            const element = ref.current;

            if (element) {
                const { default: html2canvas } = await import('html2canvas');

                const canvas = await html2canvas(element, {
                    backgroundColor: backgroundColor,
                });

                const data = canvas.toDataURL('image/png');
                const link = document.createElement('a');

                link.href = data;
                link.download = 'orarend.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        },
        [theme],
    );
}
