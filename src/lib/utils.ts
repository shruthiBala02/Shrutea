export function calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const noHtml = content.replace(/<[^>]*>?/gm, '');
    const wordCount = noHtml.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}
