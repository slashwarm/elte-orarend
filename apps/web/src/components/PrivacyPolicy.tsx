import React from 'react';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { SPACING } from '../utils/spacing';

type PrivacyPolicyProps = {
    open: boolean;
    onClose: () => void;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <>
        <Typography variant="h6" component="h3" sx={{ mt: SPACING.loose, mb: SPACING.tight, fontSize: '1.05rem' }}>
            {title}
        </Typography>
        {children}
    </>
);

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll="paper"
            maxWidth="md"
            fullWidth
            aria-labelledby="privacy-policy-title"
        >
            <DialogTitle id="privacy-policy-title" component="h2" sx={{ pr: 6 }}>
                Adatkezelési tájékoztató
                <IconButton
                    aria-label="Adatkezelési tájékoztató bezárása"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Alert severity="warning" sx={{ mb: SPACING.base }}>
                    Ez az oldal <strong>nem hivatalos</strong>. Nem áll kapcsolatban az Eötvös Loránd
                    Tudományegyetemmel, nem az ELTE üzemelteti és nem is támogatja. Egy nyílt forráskódú, hallgatói
                    kezdeményezés. A hivatalos órarendi és tanulmányi adatokért mindig a{' '}
                    <Link href="https://tanrend.elte.hu" target="_blank" rel="noopener noreferrer">
                        tanrend.elte.hu
                    </Link>{' '}
                    oldalt és a Neptunt vedd alapul.
                </Alert>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Röviden: <strong>nem gyűjtünk és nem tárolunk személyes adatot.</strong> Nincs regisztráció, nincs
                    bejelentkezés, nincsenek marketing- vagy nyomkövető sütik, és semmilyen adatot nem adunk el vagy
                    tovább harmadik félnek.
                </Typography>

                <Section title="1. Ki üzemelteti az oldalt?">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Az oldalt ELTE-s hallgatók készítették és tartják karban, önkéntes alapon, nonprofit módon. A
                        forráskód nyilvános:{' '}
                        <Link
                            href="https://github.com/slashwarm/elte-orarend"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            github.com/slashwarm/elte-orarend
                        </Link>
                        . Kérdés vagy adatkezelési kérés esetén nyiss egy issue-t a GitHubon.
                    </Typography>
                </Section>

                <Section title="2. Milyen adat marad a saját eszközödön?">
                    <Typography
                        variant="body2"
                        component="div"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Az órarended <strong>kizárólag a saját böngésződben</strong>, a localStorage tárolóban marad. Ez
                        nem sütinek számít, nem kerül fel szerverre, és mi nem látjuk. Ezt tároljuk:
                        <ul>
                            <li>
                                <code>SAVE_TIMETABLE</code> – az általad kiválasztott órák (tárgy, kurzuskód, oktató
                                neve, időpont, helyszín, saját megjegyzés).
                            </li>
                            <li>
                                <code>LESSON_COLORS</code> – az óratípusokhoz beállított színek.
                            </li>
                            <li>
                                <code>theme</code> – világos vagy sötét megjelenés.
                            </li>
                            <li>
                                <code>INFOBOX_DISMISSED_*</code> – jelölés arról, hogy egy tájékoztató üzenetet már
                                bezártál.
                            </li>
                        </ul>
                        Ha törölni akarod, elég a böngésződ oldaladatait (localStorage) törölni erre a domainre, vagy az
                        órarendet kiüríteni az alkalmazásban.
                    </Typography>
                </Section>

                <Section title="3. Mi történik a szerveren?">
                    <Typography
                        variant="body2"
                        component="div"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        A keresés úgy működik, hogy az API a nyilvános{' '}
                        <Link href="https://tanrend.elte.hu" target="_blank" rel="noopener noreferrer">
                            tanrend.elte.hu
                        </Link>{' '}
                        oldalról kérdezi le az órarendi adatokat, és továbbadja a böngésződnek.
                        <ul>
                            <li>Csak a keresőkifejezés és a félév megy át a szerverre.</li>
                            <li>
                                Nincs felhasználói fiók, nincs adatbázis, nincs profilépítés. A találatokat legfeljebb
                                10 percig tartjuk a memóriában gyorsítótárként, felhasználóhoz nem kötve.
                            </li>
                            <li>
                                Ha oktató nevére keresel, az a név átmegy a szerveren – ez ugyanaz a nyilvános adat,
                                amit a tanrend.elte.hu is közöl. Nem tároljuk el.
                            </li>
                        </ul>
                    </Typography>
                </Section>

                <Section title="4. Neptunból exportált Excel fájl">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        A feltöltött <code>.xlsx</code> fájlt <strong>a saját böngésződ dolgozza fel</strong>. A fájl
                        maga soha nem kerül fel semmilyen szerverre. Belőle csak a kurzuskódokat olvassuk ki, és
                        kizárólag azokat küldjük el a kereséshez. A benne szereplő neved, Neptun-kódod, jegyeid vagy
                        bármi más adatod nálunk marad – pontosabban nálad marad.
                    </Typography>
                </Section>

                <Section title="5. Megosztható link">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Ha megosztod az órarendedet, az órák adatai tömörítve, magába a linkbe kerülnek bele. Szerveren
                        semmit nem tárolunk el belőle. Akinek elküldöd a linket, látja az órarended tartalmát – ezért
                        csak olyannak add oda, akivel meg akarod osztani.
                    </Typography>
                </Section>

                <Section title="6. Látogatottsági statisztika (Vercel Analytics)">
                    <Typography
                        variant="body2"
                        component="div"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Az oldalt a Vercel Inc. szolgáltatja, és a{' '}
                        <Link
                            href="https://vercel.com/docs/analytics/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Vercel Web Analytics
                        </Link>{' '}
                        méri az oldalletöltéseket. Ez sütimentes megoldás:
                        <ul>
                            <li>nem tesz le sütit és nem ír a localStorage-be;</li>
                            <li>nem tárol IP-címet, és nem követ téged oldalak vagy napok között;</li>
                            <li>
                                csak összesített adatot látunk: oldalletöltések száma, hivatkozó oldal, ország, eszköz-
                                és böngészőtípus.
                            </li>
                        </ul>
                        Ezért nincs szükség sütibannerre. Az adatkezelés jogalapja a GDPR 6. cikk (1) f) pontja szerinti
                        jogos érdek: látni akarjuk, hogy hányan használják az oldalt, hogy karban tudjuk tartani.
                        Kifogásolhatod ezt a kezelést a fenti elérhetőségen.
                    </Typography>
                </Section>

                <Section title="7. Kiszolgáló naplói">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        A tárhelyszolgáltató (Vercel Inc.) adatfeldolgozóként rövid ideig technikai naplókat kezelhet az
                        üzemeltetéshez és a visszaélések elleni védelemhez. Ehhez mi nem adunk hozzá semmit, és nem
                        építünk belőle felhasználói profilt. Részletek a{' '}
                        <Link href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                            Vercel adatvédelmi tájékoztatójában
                        </Link>
                        .
                    </Typography>
                </Section>

                <Section title="8. Jogaid">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Mivel nem tárolunk hozzád köthető adatot, a hozzáféréshez, helyesbítéshez vagy törléshez való
                        jogodat a gyakorlatban nincs mihez kötni – a saját adataid a te eszközödön vannak, és bármikor
                        törölheted őket. Ha mégis kérdésed van, keress minket a GitHubon. Panasszal a Nemzeti
                        Adatvédelmi és Információszabadság Hatósághoz (NAIH,{' '}
                        <Link href="https://naih.hu" target="_blank" rel="noopener noreferrer">
                            naih.hu
                        </Link>
                        ) fordulhatsz.
                    </Typography>
                </Section>

                <Section title="9. Felelősség">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Az adatok a tanrend.elte.hu oldalról származnak, és hibásak vagy elavultak lehetnek. Az oldal
                        „ahogy van” állapotban érhető el, garancia nélkül. Vizsga- és órarendi ügyekben a hivatalos ELTE
                        felületek a mérvadóak.
                    </Typography>
                </Section>

                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mt: SPACING.loose,
                    }}
                >
                    Utolsó frissítés: 2026. augusztus 16.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Bezárás</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrivacyPolicy;
