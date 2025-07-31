// src/hooks/useForm.js
import { useState, useCallback, useRef } from "react";

const useForm = (initialValues = {}, validationRules = {}, options = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const formRef = useRef(null);
  const { validateOnChange = true, validateOnBlur = true } = options;

  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) return "";

      for (const rule of rules) {
        if (rule.required && (!value || value.toString().trim() === "")) {
          return rule.message || `${name} jest wymagane`;
        }

        if (rule.minLength && value && value.length < rule.minLength) {
          return (
            rule.message ||
            `${name} musi mieć co najmniej ${rule.minLength} znaków`
          );
        }

        if (rule.maxLength && value && value.length > rule.maxLength) {
          return (
            rule.message ||
            `${name} może mieć maksymalnie ${rule.maxLength} znaków`
          );
        }

        if (rule.pattern && value && !rule.pattern.test(value)) {
          return rule.message || `${name} ma nieprawidłowy format`;
        }

        if (rule.validate && typeof rule.validate === "function") {
          const result = rule.validate(value, values);
          if (result !== true) {
            return result || `${name} jest nieprawidłowe`;
          }
        }

        if (rule.match && value !== values[rule.match]) {
          return rule.message || `${name} musi być identyczne z ${rule.match}`;
        }
      }

      return "";
    },
    [validationRules, values]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [validateField, values]);

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (validateOnChange && touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField, validateOnChange, touched]
  );

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const clearFieldError = useCallback((name) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;
      setValue(name, fieldValue);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      if (validateOnBlur) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField, validateOnBlur]
  );

  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (e) => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        // Oznacz wszystkie pola jako touched
        const allTouched = {};
        Object.keys(values).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);

        const isFormValid = validateForm();

        if (isFormValid && onSubmit) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Błąd podczas wysyłania formularza:", error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validateForm]
  );

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setIsValid(true);
    },
    [initialValues]
  );

  const setFormData = useCallback((newData) => {
    setValues((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] || "",
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldError,
    clearFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFormData,
    validateForm,
    getFieldProps,
    formRef,
  };
};

export default useForm;
