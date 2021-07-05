import { useRef, useState } from 'react';
import {Cascader} from 'antd';
import PropTypes from 'prop-types';

const LinkPicker = ({options, value = {}, onChange}) => {
  const [customPicker, setCustomPicker] = useState();
  const customPickerRef = useRef();

  const [extra, setExtra] = useState({});

  return (
    <>
      <Cascader
        options={options}
        displayRender={(labels, selectedOptions) => {
          // 选项可能还未加载
          if (selectedOptions.length === 0) {
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
        style={{width: '100%'}}
        value={value.options || []}
        onChange={(cascaderValue, selectedOptions) => {
          const newValue = cascaderValue.length === 0 ? {} : {...value, options: cascaderValue};
          const lastOption = selectedOptions[selectedOptions.length - 1];

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
              onChange({...newValue, ...customValue});
              if (typeof extra !== 'undefined') {
                setExtra(extra);
              }
            },
          };

          setCustomPicker(<lastOption.picker pickerRef={customPickerRef} linkPicker={linkPicker} value={value}/>);

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
