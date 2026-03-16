import React, { useMemo } from 'react';
import { Text, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*?>/i;

function HtmlText({ text, style, color, numberOfLines }) {
  const { width } = useWindowDimensions();

  const flatStyle = useMemo(() => {
    if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean));
    return style || {};
  }, [style]);

  const textColor = color || flatStyle.color;

  const tagsStyles = useMemo(() => {
    const baseStyle = { ...flatStyle, color: textColor };
    return {
      body: baseStyle,
      b: { fontWeight: 'bold' },
      strong: { fontWeight: 'bold' },
      i: { fontStyle: 'italic' },
      em: { fontStyle: 'italic' },
      ul: { color: textColor },
      ol: { color: textColor },
      li: { color: textColor },
    };
  }, [flatStyle, textColor]);

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
  return (
    <RenderHtml
      contentWidth={width}
      source={{ html: text }}
      tagsStyles={tagsStyles}
    />
  );
}

export default React.memo(HtmlText);
