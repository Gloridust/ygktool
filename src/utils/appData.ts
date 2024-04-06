import matter from "gray-matter";
import externalApps from "../data/zh-CN/externalApps";
import type { AppData } from "@/types/index";

const getAppConfigFile = (appId: string, locale: string): string =>
	require(`../apps/${appId}/README.${locale}.md`).default;

const getAppConfig = (
	appId: string,
	config: {
		requiredKeys?: string[];
		locale?: string;
	} = { locale: "zh-CN" }
): { [key: string]: any } => {
	const { content, data } = matter(getAppConfigFile(appId, config.locale));

	const defaultConfig = {
		platform: ["web", "ios", "android"],
	};

	if (!config.requiredKeys) {
		return { ...defaultConfig, id: appId, ...data };
	}

	const loadedConfig = config.requiredKeys.reduce(
		(acc, key) => {
			acc[key] = data[key] || null;
			return acc;
		},
		{ id: appId }
	);

	return { ...defaultConfig, ...loadedConfig };
};

const getAppDoc = (appId: string, locale: string = "zh-CN"): string => {
	const { content } = matter(getAppConfigFile(appId, locale));
	return content.toString();
};

const allAppsContext = require.context("../apps", true, /(zh-CN\.md)$/);
const allAppsContext_en = require.context("../apps", true, /(en-US\.md)$/);

const getAllApps = (
	includeExternal: boolean = true,
	locale?: string
): AppData[] => {
	const appsContext = { ...allAppsContext, allAppsContext_en };

	const allApps = appsContext
		.keys()
		.slice(0, appsContext.keys().length / 2)
		.map((key) => {
			const appId = key.split("/")[1];

			if (!locale) {
				return ["zh-CN", "en-US"].map((locale) => {
					return { id: appId, locale, ...getAppConfig(appId, { locale }) };
				});
			}

			return [{ id: appId, locale, ...getAppConfig(appId, { locale }) }];
		})
		.flat(1);

	return includeExternal ? [...allApps, ...externalApps] : allApps;
};

export { getAllApps, getAppConfig, getAppDoc };
