import { useMemo, useRef, useState } from 'react';
import { Cascader } from 'antd';
import PropTypes from 'prop-types';

/**
 * 遍历所有的选项，如果找到值等于 `type`，表示选中该选项
 */
const typeToValue = (type, options) => {
  for (const option of options) {
    // 第一级找到
    if (option.value === type) {
      return [option.value];
    }
    // 第二级找到
    const child = option.children?.find(child => child.value === type);
    if (child) {
      return [option.value, child.value];
    }
  }
}

/**
 * 只记录最后一个值为 `type`，减少要存储的内容
 */
const valueToType = (cascaderValue) => {
  return cascaderValue.length === 0 ? {} : { type: cascaderValue.at(-1) };
};

const LinkPicker = ({ options = [], value = {}, onChange }) => {
  const [customPicker, setCustomPicker] = useState();
  const customPickerRef = useRef();

  const [extra, setExtra] = useState({});

  // 在当前实例中缓存所有填过的值
  const allValue = useRef({});

  const cascaderValue = useMemo(() => {
    return typeToValue(value.type, options);
  }, [options, value.type]);

  return (
    <>
      <Cascader
        options={options}
        displayRender={(labels, selectedOptions) => {
          // 选项可能还未加载
          if (selectedOptions.length === 0) {
            return;
          }

          // 选项未加载完
          if (null === selectedOptions[0]) {
            return;
          }

          return labels.map((label, i) => {
            const option = selectedOptions[i];
            return (
              <span key={option.value}>
                {option.inputLabel || label}
                {i === labels.length - 1 ? ' ' : ' / '}
                {option.pickerLabel && ' / '}
                {option.pickerLabel && <option.pickerLabel value={value} extra={extra}/>}
              </span>
            );
          });
        }}
        expandTrigger="hover"
        style={{ width: '100%' }}
        value={cascaderValue}
        onChange={(cascaderValue, selectedOptions) => {
          const newValue = valueToType(cascaderValue);
          const lastOption = selectedOptions[selectedOptions.length - 1];

          // 缓存所有值
          allValue.current = { ...allValue.current, ...value, ...newValue };

          if (!lastOption || !lastOption.picker) {
            onChange(newValue);
            setCustomPicker(null);
            return;
          }

          const linkPicker = {
            /**
             * @param customValue Custom value add to the form
             * @param extra extra data, may be used for display, caching
             */
            addValue: (customValue, extra) => {
              onChange({ ...newValue, ...customValue });
              if (typeof extra !== 'undefined') {
                setExtra(extra);
              }
            },
          };

          setCustomPicker(
            <lastOption.picker
              pickerRef={customPickerRef}
              linkPicker={linkPicker}
              // 将所有值传入自定义选择器，以便读到之前设置过的值
              value={allValue.current}
            />
          );

          // 每次选中时都要展示自定义选择器
          customPickerRef.current && customPickerRef.current.show();
        }}
      />
      {customPicker}
    </>
  );
};

LinkPicker.propTypes = {
  options: PropTypes.array,
  value: PropTypes.object,
  onChange: PropTypes.func,
};

export default LinkPicker;
