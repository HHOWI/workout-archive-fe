import React, { useState } from "react";
import { Button } from "@mui/material";
import { Send } from "@mui/icons-material";
import {
  CommentInputContainer,
  CommentFormContainer,
  CommentInput,
} from "./CommentSectionStyles";

interface CommentFormProps {
  onSubmit: (text: string) => void;
  initialText?: string;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  buttonText?: string;
  showSendIcon?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  initialText = "",
  onTextChange,
  placeholder = "댓글을 작성해주세요...",
  buttonText,
  showSendIcon = true,
}) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSubmit(text);
    setText("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  return (
    <CommentInputContainer>
      <CommentFormContainer onSubmit={handleSubmit}>
        <CommentInput
          fullWidth
          placeholder={placeholder}
          variant="outlined"
          size="small"
          value={text}
          onChange={handleChange}
          multiline
          minRows={1}
          maxRows={3}
          sx={{
            "& .MuiOutlinedInput-root": {
              paddingTop: "8px",
              paddingBottom: "8px",
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!text.trim()}
          type="submit"
          sx={{
            minWidth: buttonText ? "auto" : "42px",
            width: buttonText ? "auto" : "42px",
            height: "42px",
            padding: buttonText ? "0 16px" : 0,
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
            },
            alignSelf: "flex-start",
          }}
        >
          {buttonText ? buttonText : showSendIcon && <Send fontSize="small" />}
        </Button>
      </CommentFormContainer>
    </CommentInputContainer>
  );
};

export default CommentForm;
