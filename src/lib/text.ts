/** sdk-data.ts prose without its markup (`code`, [links](url)), for meta descriptions and llms.txt. */
export const plain = (text: string) => text.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
