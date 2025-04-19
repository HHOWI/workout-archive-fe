import styled from "@emotion/styled";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Typography,
  Avatar,
  TextField,
} from "@mui/material";
import { Reply, FormatQuote } from "@mui/icons-material";

// 스타일 컴포넌트
export const CommentContainer = styled(Paper)`
  padding: 0;
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
  margin-top: 20px;
  overflow: hidden;
  border: none;
`;

export const CommentHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const CommentTitle = styled(Typography)`
  font-weight: 600;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CommentCount = styled(Chip)`
  font-weight: 500;
  font-size: 13px;
  height: 24px;
`;

export const CommentInputContainer = styled(Box)`
  margin-bottom: 24px;
`;

export const CommentFormContainer = styled.form`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export const CommentInput = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 8px;
    background-color: #fafafa;
    transition: all 0.2s ease;
    font-size: 14px;
    min-height: 42px;

    &:hover {
      background-color: #f5f5f5;
    }

    &.Mui-focused {
      background-color: #ffffff;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }
  }
`;

export const CommentList = styled(Box)`
  margin-top: 16px;
`;

export const CommentItemContainer = styled(Card, {
  shouldForwardProp: (prop) => prop !== "isReply",
})<{ isReply: boolean }>`
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: ${(props) => (props.isReply ? "#fafafa" : "#ffffff")};
  border: 1px solid ${(props) => (props.isReply ? "#f0f0f0" : "#f5f5f5")};
  box-shadow: none;
  position: relative;
  margin-left: ${(props) => (props.isReply ? "32px" : "0")};
  overflow: visible;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CommentContent = styled(CardContent)`
  padding: 16px;
  &:last-child {
    padding-bottom: 16px;
  }
`;

export const CommentText = styled(Typography)`
  margin: 8px 0 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-break: break-word;
`;

export const CommentActions = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

export const ActionButton = styled(Button)`
  text-transform: none;
  font-size: 12px;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 400;
  min-width: 0;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const CommentMeta = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

export const CommentHeaderActions = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
`;

export const AuthorAvatar = styled(Avatar)`
  width: 32px;
  height: 32px;
  border: none;
`;

export const ReplyAuthorAvatar = styled(AuthorAvatar)`
  width: 32px;
  height: 32px;
`;

export const CommentAuthor = styled(Typography)`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

export const CommentTime = styled(Typography)`
  font-size: 12px;
  color: #888;
`;

export const NoComments = styled(Box)`
  text-align: center;
  padding: 32px 0;
  color: #888;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background-color: #fafafa;
  border-radius: 8px;
`;

export const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 32px 0;
`;

export const ReplyForm = styled(Box)`
  margin-top: 12px;
  margin-bottom: 0;
`;

export const CommentMenu = styled(Box)`
  position: relative;
  margin-left: auto;
`;

export const MenuOptions = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isOpen",
})<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 28px;
  width: 120px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${(props) => (props.isOpen ? "block" : "none")};
  overflow: hidden;
  border: 1px solid #f0f0f0;
`;

export const MenuItem = styled(Button)`
  display: block;
  width: 100%;
  text-align: left;
  justify-content: flex-start;
  padding: 8px 12px;
  border-radius: 0;
  text-transform: none;
  font-size: 13px;
  color: #333;
  font-weight: 400;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const LoadMoreButton = styled(Button)`
  margin-top: 16px;
  padding: 6px 16px;
  border-radius: 6px;
  text-transform: none;
  font-weight: 500;
  font-size: 13px;
  width: 100%;
  background-color: #fafafa;
  border: 1px solid #eaeaea;
  color: #666;

  &:hover {
    background-color: #f0f0f0;
    border-color: #ddd;
  }
`;

export const LikeButton = styled(ActionButton, {
  shouldForwardProp: (prop) => prop !== "liked",
})<{ liked: boolean }>`
  color: ${(props) => (props.liked ? "#1976d2" : "#666")};
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: ${(props) => (props.liked ? "500" : "400")};

  &:hover {
    background-color: ${(props) =>
      props.liked ? "rgba(25, 118, 210, 0.08)" : "#f5f5f5"};
  }
`;

export const UserInfoContainer = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const ReplyIcon = styled(Reply)`
  font-size: 16px;
`;

export const ReplyIndicator = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #888;
`;

export const ReplyIndicatorIcon = styled(FormatQuote)`
  font-size: 14px;
  transform: rotate(180deg);
  color: #aaa;
`;

export const RepliesToggleButton = styled(Button)`
  font-size: 12px;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 8px;
  margin-bottom: 8px;
  text-transform: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const ReplyLoaderContainer = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 12px 0;
`;

export const LoadMoreRepliesButton = styled(Button)`
  font-size: 12px;
  color: #666;
  width: 100%;
  padding: 4px 0;
  margin-top: 8px;
  text-transform: none;
  background-color: #fafafa;
  border-radius: 4px;

  &:hover {
    background-color: #f0f0f0;
  }
`;
