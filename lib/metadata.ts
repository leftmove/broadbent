export function embedMetadata(
  name: string,
  message: string,
  meta: Record<string, any>
) {
  return `<<${JSON.stringify({ name, message, ...meta })}>>`;
}

export function extractMetadata(message: string) {
  const metadataRegex = /<<(.+?)>>/;
  const match = message.match(metadataRegex);

  if (!match) {
    throw Error("No metadata found");
  }

  return JSON.parse(match[1]);
}
