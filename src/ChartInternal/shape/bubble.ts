/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {KEY} from "../../module/Cache";
import {getMinMax, isArray, isFunction, isNumber, isObject} from "../../module/util";

export default {
	/**
	 * Initializer
	 * @private
	 */
	initBubble(): void {
		const $$ = this;
		const {config} = $$;

		if ($$.hasType("bubble")) {
			config.point_show = true;
			config.point_type = "circle";
			config.point_sensitivity = 25;
		}
	},

	/**
	 * Get user agent's computed value for the total length of the path in user units
	 * https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getTotalLength
	 * @returns {number}
	 * @private
	 */
	getBaseLength(): number {
		const $$ = this;
		const {axis} = $$.$el;
		const cacheKey = KEY.bubbleBaseLength;
		let baseLength = $$.cache.get(cacheKey);

		if (!baseLength) {
			$$.cache.add(cacheKey, baseLength = getMinMax("min", [
				axis.x.select("path").node()
					.getTotalLength(),
				axis.y.select("path").node()
					.getTotalLength()
			]));
		}

		return baseLength;
	},

	/**
	 * Get the radius value for bubble circle
	 * @param {object} d Data object
	 * @returns {number}
	 * @private
	 */
	getBubbleR(d): number {
		const $$ = this;
		let maxR = $$.config.bubble_maxR;

		if (isFunction(maxR)) {
			maxR = maxR.bind($$.api)(d);
		} else if (!isNumber(maxR)) {
			maxR = ($$.getBaseLength() / ($$.getMaxDataCount() * 2)) + 12;
		}

		const max = getMinMax("max", $$.getMinMaxData().max.map(d => (
			$$.isBubbleZType(d) ?
				$$.getBubbleZData(d.value, "y") : (
					isObject(d.value) ? d.value.mid : d.value
				)
		)));
		const maxArea = maxR * maxR * Math.PI;
		const area = ($$.isBubbleZType(d) ? $$.getBubbleZData(d.value, "z") : d.value) * (maxArea / max);

		return Math.sqrt(area / Math.PI);
	},

	/**
	 * Get bubble dimension data
	 * @param {object|Array} d data value
	 * @param {string} type - y or z
	 * @returns {number}
	 * @private
	 */
	getBubbleZData(d, type: "y" | "z"): number {
		return isObject(d) ? d[type] : d[type === "y" ? 0 : 1];
	},

	/**
	 * Determine if bubble has dimension data
	 * @param {object|Array} d data value
	 * @returns {boolean}
	 * @private
	 */
	isBubbleZType(d): boolean {
		const $$ = this;

		return $$.isBubbleType(d) && (
			(isObject(d.value) && ("z" in d.value || "y" in d.value)) ||
			(isArray(d.value) && d.value.length === 2)
		);
	}
};