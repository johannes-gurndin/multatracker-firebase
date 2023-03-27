import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { CircularProgress, Container, CssBaseline, Drawer, IconButton, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import { useEffect, useState } from "react";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from "../firebase/auth";
import { useRouter } from "next/router";


const pages = ['Home', 'Teams', 'Login/Register']
const links = ['/', '/teams', '/login'];
const drawerWidth = 250;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));


const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        height: '64px',
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));


const Layout = ({ children }) => {

    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const router = useRouter();

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const { authUser, signOut, isLoading } = useAuth();

    useEffect(() => {
        if (!authUser && !isLoading && router.pathname !== '/') {
            router.push('/');
        } else if (!isLoading && authUser != null && router.pathname === '/') {
            router.push('/teams');
        } 
    }, [authUser, isLoading]);

    useEffect(() => {
        if (router.pathname === '/' && !isLoading && authUser) {
            router.push('/teams');
        }
    }, [router]);

    return ((!authUser && router.pathname !== '/') || (isLoading || !!authUser && router.pathname === '/') ? 
        <CircularProgress color="inherit" sx={{ml: '50%', mt: '25%'}}/>
        : <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" open={open}>
                    <Toolbar>
                        {authUser &&
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={handleDrawerOpen}
                                edge="start"
                                sx={{ ml: 2, mr: 1, ...(open && { display: 'none' }) }}
                            >
                                <MenuIcon />
                            </IconButton>
                        }
                        <Typography variant="h3" noWrap component="div" sx={{ ml: 2 }}>
                            Multa Tracker
                        </Typography>
                        {authUser &&
                            <>
                                <Typography variant="h6" noWrap component="div" sx={{ ml: 'auto' }}>
                                    {authUser.email}
                                </Typography>
                                <IconButton
                                    color="inherit"
                                    aria-label="logout"
                                    onClick={signOut}
                                    sx={{ width: '100px' }}
                                >
                                    Logout
                                </IconButton>
                            </>
                        }
                    </Toolbar>
                </AppBar>
                <Drawer
                    open={open}
                    anchor='left'
                    variant="persistent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                        }
                    }}
                >
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </DrawerHeader>
                    {pages.map((page, idx) => (
                        <Link href={links[idx]} key={page}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemText primary={page} />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    ))}
                </Drawer>
            </Box>

            <Box sx={{ padding: '64px 20px', width: '100%', height: '100vh' }} onClick={handleDrawerClose}>
                {children}
            </Box>
        </>
    );
}

export default Layout;