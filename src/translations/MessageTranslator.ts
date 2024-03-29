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

import * as fs from 'node:fs';
import * as path from 'node:path';
import MessagePlaceholder, { MessagePlaceholderOptions } from '../placeholder/MessagePlaceholder';
import Locale from '../locale/Locale';

/**
 * MessageTranslator class for managing language translations.
 * @class
 */
export class MessageTranslator {
    private placeholderHandler: MessagePlaceholder = new MessagePlaceholder();
    private translations: { [langName: string]: { [key: string]: string } } = {};
    private fallback: { [key: string]: string } | undefined;

    /**
     * Constructor for MessageTranslator class.
     * @constructor
     * @param {MessagePlaceholderOptions} defaultReplacements - Default message placeholder replacements.
     */
    constructor(defaultReplacements: MessagePlaceholderOptions) {
        this.placeholderHandler.addDefaultReplacements(defaultReplacements);
    }

    /**
     * Load language translations from JSON files in the specified folder and its subfolders.
     * @param {string} folderPath - The path to the folder containing language JSON files.
     * @param {string} defaultLanguage - Optional parameter specifying the default language. Defaults to 'en'.
     */
    loadTranslationsFromFolder(folderPath: string, defaultLanguage: string = 'en'): void {
        try {
            const languageFolders: string[] = fs.readdirSync(folderPath);

            languageFolders.forEach((langName: string) => {
                const lowerLangName: string = langName.toLowerCase();
                const languageFolderPath: string = path.join(folderPath, langName);
                const translations: { [key: string]: string } = {};

                if (fs.statSync(languageFolderPath).isDirectory()) {
                    const files: string[] = this.readFilesRecursively(languageFolderPath);

                    files.forEach((filePath: string) => {
                        const relativePath: string = path.relative(languageFolderPath, filePath);
                        const key: string = this.getKeyFromPath(relativePath);
                        const data: string = fs.readFileSync(filePath, 'utf8');
                        const fileTranslations: { [key: string]: any } = JSON.parse(data);

                        // Flatten nested translations into the current language object
                        this.flattenTranslations(fileTranslations, translations, key);

                        if (!this.fallback) {
                            this.fallback = translations;
                        }
                    });

                    this.translations[lowerLangName] = translations;
                }
            });

            // Set the default fallback properties based on the specified or default language
            this.fallback = this.translations[defaultLanguage.toLowerCase()] || this.fallback;
        } catch (error) {
            console.error('Error loading translations from folder:', error);
        }
    }

    /**
     * Recursively reads all JSON files in a folder and its subfolders.
     * @private
     * @param {string} folderPath - The path to the folder.
     * @returns {string[]} - Array of file paths.
     */
    readFilesRecursively(folderPath: string): string[] {
        const files: string[] = [];
        const entries: fs.Dirent[] = fs.readdirSync(folderPath, { withFileTypes: true });

        entries.forEach((entry: fs.Dirent) => {
            const fullPath: string = path.join(folderPath, entry.name);

            if (entry.isDirectory()) {
                files.push(...this.readFilesRecursively(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
                files.push(fullPath);
            }
        });

        return files;
    }

    /**
     * Extracts a translation key from a file path.
     * @private
     * @param {string} filePath - The file path.
     * @returns {string} - The extracted translation key.
     */
    getKeyFromPath(filePath: string): string {
        const parts: string[] = filePath.split(path.sep);
        parts.pop();

        // Extract subfolder and filename separately
        const subfolder: string = parts.join('.');
        const filename: string = path.basename(filePath, '.json'); // Remove the extension

        const key = [subfolder, filename].filter(Boolean).join('.');
        // Concatenate subfolder and filename with a dot separator
        return key;
    }

    /**
     * Translate a key with optional replacements.
     * @param {string} key - The translation key.
     * @param {...any} args - Optional replacements for placeholders in the translation.
     * @returns {string} - The translated string.
     */
    translate(key: string, ...args: any[]): string {
        const replace: MessagePlaceholderOptions = {};

        args.forEach((arg, i) => {
            if (typeof arg === 'object') {
                Object.keys(arg).forEach((k) => {
                    replace[k] = arg[k];
                });
            } else replace[i.toString()] = arg;
        });

        return this.placeholderHandler.fastFormat(this.fallback?.[key] || key, replace);
    }

    /**
     * Translate a key to a specific language with optional replacements.
     * @param {Locale} locale - The target language locale.
     * @param {string} key - The translation key.
     * @param {...any} args - Optional replacements for placeholders in the translation.
     * @returns {string} - The translated string in the specified language.
     */
    translateTo(locale: Locale, key: string, ...args: any[]): string {
        const lowerLangName: string = locale.toLowerCase();

        const replace: MessagePlaceholderOptions = {};

        args.forEach((arg, i) => {
            if (typeof arg === 'object') {
                Object.keys(arg).forEach((k) => {
                    replace[k] = arg[k];
                });
            } else replace[i.toString()] = arg;
        });

        // console.log(replace);

        // Check if translation for the specified language exists
        if (this.translations[lowerLangName]) {
            // Attempt to get the translation for the specified key
            const translation: string = this.translations[lowerLangName]?.[key];

            if (translation !== undefined) {
                // Attempt to resolve nested keys (e.g., en-GB.name)
                const resolvedTranslation: string = translation.split('.').reduce<string>((obj, part) => {
                    if (obj && typeof obj === 'object' && part in obj) {
                        return obj[part] as unknown as string;
                    } else {
                        return '';
                    }
                }, key);

                return this.placeholderHandler.fastFormat(resolvedTranslation || translation, replace);
            }
        }

        // Fallback to the default language
        const defaultTranslation: string = this.translate(key, args) || key;

        if (defaultTranslation !== undefined) {
            return this.placeholderHandler.fastFormat(defaultTranslation, replace);
        }

        // Fallback to the original key if no translation is found
        return this.placeholderHandler.fastFormat(key, args);
    }

    /**
     * Converts the lowercase suffix (including the hyphen) of a given string to uppercase.
     * If no hyphen is present, the entire string is converted to uppercase.
     * @param {string} input - The input string to be processed.
     * @returns {string} - The modified string with the lowercase suffix (including the hyphen) in uppercase.
     */
    uppercaseSuffix(input: string): string {
        // Find the last occurrence of the hyphen in the string
        const lastIndex = input.lastIndexOf('-');

        if (lastIndex !== -1) {
            // Separate the string into prefix and suffix
            const prefix = input.substring(0, lastIndex);
            const suffix = input.substring(lastIndex).toUpperCase();

            // Combine the prefix and the uppercase suffix
            return prefix + suffix;
        } else {
            // If no hyphen is found, convert the entire string to uppercase
            return input;
        }
    }

    /**
     * Initialize locales for language support.
     * @returns {Record<Locale, string | null>} - Object with initialized locales.
     */
    initializeLocales = (): Record<Locale, string | null> => {
        const locales: Record<Locale, string | null> = {} as Record<Locale, string | null>;

        Object.keys(locales).forEach((locale) => {
            locales[locale as Locale] = null;
        });

        return locales;
    };

    /**
     * Recursively flattens nested translations into the current language object.
     * @param {object} source - The source object with nested translations.
     * @param {object} target - The target object to store flattened translations.
     * @param {string} prefix - The prefix to be added to each flattened translation key.
     */
    flattenTranslations(source: { [key: string]: any }, target: { [key: string]: string }, prefix: string = ''): void {
        Object.entries(source).forEach(([key, value]) => {
            const fullKey: string = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object') {
                // Recursively flatten nested translations
                this.flattenTranslations(value, target, fullKey);
            } else {
                // Add the flattened translation to the target object
                target[fullKey] = value;
            }
        });
    }

    /**
     * Get the default fallback language.
     * @returns {{ [key: string]: string } | undefined} - The default fallback language.
     */
    getDefaultFallback(): { [key: string]: string } | undefined {
        return this.fallback;
    }

    /**
     * Get a list of available languages based on the loaded translations.
     * @returns {Locale[]} - An array of available languages.
     */
    getAvailableLanguages(): Locale[] {
        return Object.keys(this.translations).map((l: string) => this.uppercaseSuffix(l) as Locale);
    }
}

export default MessageTranslator;
