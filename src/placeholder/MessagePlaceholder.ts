/**
 * Copyright (c) 2023 - present | sanguine6660 <sanguine6660@gmail.com>
 * Copyright (c) 2023 - present | voxify.dev <contact@voxify.dev>
 * Copyright (c) 2023 - present | voxify.dev team and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export interface MessagePlaceholderOptions {
    [key: string]: any;
}

/**
 * MessagePlaceholder class for handling message placeholders and replacements.
 * This class provides functionality to format strings with placeholders and replacements.
 * @class
 */
export class MessagePlaceholder {
    private defaultReplacements: { [key: string]: any };

    /**
     * Constructor for MessagePlaceholder class.
     * Initializes an instance with an empty set of default replacements.
     * @constructor
     */
    constructor() {
        this.defaultReplacements = {};
    }

    /**
     * Formats a string with placeholders and replacements.
     * @param {string} format - The string format with placeholders.
     * @param {MessagePlaceholderOptions} values - Optional replacements for placeholders.
     * @returns {string} - The formatted string with applied replacements.
     */
    fastFormat(format: string, values?: MessagePlaceholderOptions): string {
        const replacements = { ...this.getDefaultReplacements(), ...values };

        return format.replace(/\$\{([^}]+)\}/g, (_, key) => String(replacements[key] || 'none'));
    }

    /**
     * Adds default replacements to the existing set.
     * @param {MessagePlaceholderOptions} additionalReplacements - Additional default replacements.
     */
    addDefaultReplacements(additionalReplacements: MessagePlaceholderOptions): void {
        if (additionalReplacements) {
            this.defaultReplacements = { ...this.defaultReplacements, ...additionalReplacements };
        }
    }

    /**
     * Retrieves a copy of the current default replacements.
     * @returns {MessagePlaceholderOptions} - Copy of the current default replacements.
     */
    getDefaultReplacements(): { [key: string]: any } {
        return { ...this.defaultReplacements };
    }

    /**
     * Sets the default replacements to a new set of replacements.
     * @param {MessagePlaceholderOptions} defaultReplacements - New set of default replacements.
     */
    setDefaultReplacements(defaultReplacements: MessagePlaceholderOptions): void {
        this.defaultReplacements = { ...(defaultReplacements || {}) };
    }
}

export default MessagePlaceholder;
