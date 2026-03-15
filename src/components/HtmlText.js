import React from 'react';
import { Text, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*?>/i;

export default function HtmlText({ text, style, color, numberOfLines }) {
  const { width } = useWindowDimensions();

  if (!text) return null;

  // Plain text — no HTML tags
  if (!HTML_TAG_REGEX.test(text)) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  // HTML content
  const flatStyle = Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : style || {};

  const textColor = color || flatStyle.color;

  const baseStyle = { ...flatStyle, color: textColor };

  // Provide tag-level styles so bold/italic/list tags render correctly
  const tagsStyles = {
    body: baseStyle,
    b: { fontWeight: 'bold' },
    strong: { fontWeight: 'bold' },
    i: { fontStyle: 'italic' },
    em: { fontStyle: 'italic' },
    ul: { color: textColor },
    ol: { color: textColor },
    li: { color: textColor },
  };

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html: text }}
      tagsStyles={tagsStyles}
    />
  );
}
