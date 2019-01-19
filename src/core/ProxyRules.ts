﻿/*
 * This file is part of SmartProxy <https://github.com/salarcode/SmartProxy>,
 * Copyright (C) 2019 Salar Khalilzadeh <salar2k@gmail.com>
 *
 * SmartProxy is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * SmartProxy is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SmartProxy.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Debug } from "../lib/Debug";
import { ProxyRule } from "./Settings";
import { ProxyRuleType } from "./definitions";
import { Utils } from "../lib/Utils";

export class ProxyRules {

	static compiledRulesList: CompiledRule[] = [];

	public static compileRules(proxyRules: ProxyRule[]) {
		if (!proxyRules)
			return;

		let compiledList: CompiledRule[] = [];

		for (let i = 0; i < proxyRules.length; i++) {
			const rule = proxyRules[i];

			if (!rule.enabled) continue;

			let newCompiled = new CompiledRule();
			Object.assign(newCompiled, rule);


			switch (rule.ruleType) {
				case ProxyRuleType.Exact:
					newCompiled.ruleExact = newCompiled.ruleExact.toLowerCase();
					break;

				case ProxyRuleType.MatchPattern:
					{
						let regex = Utils.matchPatternToRegExp(rule.rulePattern);
						if (regex == null)
							continue;
						newCompiled.regex = regex;
					}
					break;

				case ProxyRuleType.Regex:
					{
						// TODO: is this simple construction good enough? is ^(?:)$ needed?
						newCompiled.regex = new RegExp(rule.ruleRegex);
					}
					break;

				default:
					continue;
			}

			compiledList.push(newCompiled);
		}

		// apply the new rules
		ProxyRules.compiledRulesList = compiledList;

		// TODO: remove this
		console.log("DEL: compileRules> ", compiledList);
	}


	public static findMatchForUrl(url: string): ProxyRule | null {
		//var host = new URL(url).host;
		let lowerCaseUrl: string;

		try {
			for (let i = 0; i < this.compiledRulesList.length; i++) {
				let compiled = this.compiledRulesList[i];

				if (compiled.ruleType == ProxyRuleType.Exact) {
					if (lowerCaseUrl == null)
						lowerCaseUrl = url.toLowerCase();

					if (lowerCaseUrl == compiled.ruleExact)
						return compiled;
				}
				else {
					if (compiled.regex.test(url))
						return compiled;
				}
			}
		} catch (e) {
			Debug.warn(`findMatchForUrl failed for ${url}`, e);
		}
		return null;
	}
}

class CompiledRule extends ProxyRule {
	regex: RegExp;
}