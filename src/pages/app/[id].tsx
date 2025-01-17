import { HelpOutlineTwoTone } from "@mui/icons-material";
import { useAction } from "@/contexts/action";
import { useAppBar } from "@/contexts/appBar";
import { useLocale } from "@/contexts/locale";
import AppMenu from "@/components/AppMenu";
import IconButton from "@mui/material/IconButton";
import RightDrawer from "@/components/RightDrawer";
import { FC, useCallback, useEffect, useState } from "react";
import { GetStaticProps } from "next";
import { isCapacitor } from "@/utils/platform";
import { defaultLocale } from "src/site.config";
import { styled } from "@mui/material/styles";
import appImportList from "@/utils/appEntry";
import { getAppConfig, getAppDoc } from "@/utils/appData";
import getPaths from "@/utils/getPaths";
import { store as frameStore } from "@/utils/Data/frameState";

const drawerWidth: number = 260;

const PREFIX = "RDrawer";

const classes = {
	content: `${PREFIX}-content`,
	contentShift: `${PREFIX}-contentShift`,
};

const Root = styled("div")<{ freeSize?: boolean }>(
	({ theme }) =>
		({ freeSize }) => ({
			paddingX: `${freeSize ? "0" : theme.spacing(2)}`,
			margin: freeSize ? "unset" : "0 auto 24px auto",
			width: "100%",
			// maxWidth: freeSize ? "unset" : "1120px",
			[`& .${classes.content}`]: {
				position: "relative",
				// minHeight: "calc(100vh - 56px - 12px)",
				[theme.breakpoints.up("sm")]: {
					marginRight: 16,
					borderRadius: "24px",
				},
				marginX: { sm: 4, xs: 0 },
				background: theme.palette.background.paper,
				padding: freeSize ? "0" : "30px",
				flexGrow: 1,
				transition: theme.transitions.create("margin", {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.leavingScreen,
				}),
			},

			[`& .${classes.contentShift}`]: {
				[theme.breakpoints.up("sm")]: {
					transition: theme.transitions.create("margin", {
						easing: theme.transitions.easing.easeOut,
						duration: theme.transitions.duration.enteringScreen,
					}),
					marginRight: drawerWidth,
				},
			},
		})
);

export async function getStaticPaths() {
	if (isCapacitor()) {
		return {
			paths: getPaths(),
			fallback: false,
		};
	}

	return {
		paths: ["zh-CN", "en-US"].map((locale) => getPaths(locale)).flat(1),
		fallback: false,
	};
}

export const getStaticProps: GetStaticProps = ({
	locale = defaultLocale,
	...ctx
}) => {
	const { id: currentId } = ctx.params;

	const appConfig = getAppConfig(currentId as string, {
		requiredKeys: ["name", "status", "freeSize", "platform"],
		locale: locale,
	});

	const appDoc = getAppDoc(currentId as string);

	const dic = require("../../data/i18n.json");

	return {
		props: {
			currentPage: {
				title: appConfig.name,
				description: appConfig.description || "",
				path: "/app/" + appConfig.id,
			},
			dic: JSON.stringify(dic),
			appConfig,
			locale,
			appDoc,
		},
	};
};

const SidebarToggle = ({ handleToggle }) => {
	return (
		<IconButton
			aria-label="Switch drawer"
			onClick={handleToggle}
			edge="end"
			size="large"
			sx={
				{
					// mr: { sm: `${RightDrawerOpen ? drawerWidth + 10 : 0}px` },
				}
			}
		>
			<HelpOutlineTwoTone />
		</IconButton>
	);
};

/**
 * Universal App Container
 */
const AppContainer = ({ appConfig, appDoc }) => {
	const [FeedbackComp, setFeedbackComp] = useState(null);
	const [showFeedbackComp, setShowFeedbackComp] = useState(false);

	const { setAction } = useAction();
	const { appBar, setAppBar } = useAppBar();
	const { locale } = useLocale();

	const loadLink =
		appConfig.status === "stable" || appConfig.status === "beta"
			? appConfig.id
			: "__development";

	const AppComp = appImportList[loadLink] as FC;

	useEffect(() => {
		setAction(<SidebarToggle handleToggle={() => setAppBar(!appBar)} />);
	}, [appBar]);

	useEffect(() => {
		if (window.location.search.indexOf("fullscreen=1") !== -1) {
			frameStore.dispatch({ type: "frame/disabled" });
		}

		return () => {
			window.loadHide();
		};
	}, []);

	const feedback = useCallback(() => {
		if (!FeedbackComp) {
			// setFeedbackComp(
			//   !FeedbackComp &&
			//   Loadable(() => import("@/components/FeedbackComp"))
			// );
		}
		setShowFeedbackComp(true);
	}, [FeedbackComp]);

	return (
		<Root freeSize={!!appConfig.freeSize}>
			<div
				className={`${classes.content} ${
					appBar ? classes.contentShift : ""
				}`}
			>
				{AppComp && <AppComp />}
			</div>
			<RightDrawer onClose={() => setAppBar(!appBar)} open={appBar}>
				<AppMenu
					appDoc={appDoc[locale]}
					feedback={feedback}
					appConfig={appConfig}
				/>
			</RightDrawer>
		</Root>
	);
};

export default AppContainer;
