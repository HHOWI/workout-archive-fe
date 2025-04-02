# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## 리팩토링 내역

### 무한 스크롤 공통화

프로젝트 내의 여러 페이지(WorkoutPlacePage, ProfilePage, NotificationsPage)에서 사용되던 무한 스크롤 로직을 재사용 가능한 커스텀 훅으로 분리했습니다.

- `src/hooks/useInfiniteScroll.ts`: 무한 스크롤 로직을 관리하는 커스텀 훅
- 사용법은 `src/hooks/README.md` 참조

### 스타일 공통화

여러 페이지에서 반복되는 스타일 코드를 공통 컴포넌트로 추출했습니다.

- `src/styles/theme.ts`: 테마 변수, 애니메이션, 미디어 쿼리 등 정의
- `src/styles/CommonStyles.ts`: 재사용 가능한 스타일 컴포넌트 정의
- 자세한 내용은 `src/styles/README.md` 참조

이러한 리팩토링을 통해 코드 중복을 줄이고, 유지보수성을 향상시켰습니다.
