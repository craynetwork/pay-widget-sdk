import css from "../style.css";
import typography from "../styles/typography.css";
import PayModal from "./steps/modal";
import { ReactElement, ReactNode, useContext, useEffect } from "react";
import { CrayContext, defaultValue } from "../providers";
import { IPaymentStatus } from "../types";
import Button from "../ui/button";
import { ICrayPayload, IOrder } from "../interface";
import ReactDOM from "react-dom";
let crayModal = document.getElementById("cray-modal")?.shadowRoot;
if (!crayModal) {
  const container = document.createElement("div");
  container.setAttribute("id", "cray-modal");
  document.body.appendChild(container);
  container.attachShadow({ mode: "open" });
  crayModal = container.shadowRoot;
}
const CloseIcon = () => {
  const { setState } = useContext(CrayContext);
  const handleClose = () => {
    setState((state) => ({ ...state, status: IPaymentStatus.idle }));
  };
  return (
    <button
      onClick={handleClose}
      className=" cursor-pointer absolute top-2 right-2 hover:bg-gray-100 rounded-full p-2 active:bg-gray-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16px"
        viewBox="0 -960 960 960"
        width="16px"
        fill="black"
      >
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
      </svg>
    </button>
  );
};
const Portal = ({
  children,
  portalTarget,
}: {
  children: ReactNode;
  portalTarget: ShadowRoot;
}) => {
  if (portalTarget) {
    return ReactDOM.createPortal(children, portalTarget);
  } else {
    return children;
  }
};
const PayWidget = ({
  payload,
  testnet,
  apiKey,
  onPaymentStarted,
  onPaymentCompleted,
  onPaymentFailed,
  children,
}: {
  payload: ICrayPayload;
  testnet: boolean;
  apiKey: string;
  onPaymentStarted: (params: IOrder) => any;
  onPaymentCompleted: (params: IOrder) => any;
  onPaymentFailed: (params: IOrder) => any;
  children?: ReactElement;
}) => {
  const {
    state: { loading, status },
    setState,
  } = useContext(CrayContext);
  useEffect(() => {}, [loading]);
  switch (status) {
    case IPaymentStatus.idle:
      return children ? (
        <children.type
          {...children.props}
          onClick={() =>
            setState(() => ({
              ...defaultValue,
              apiKey,
              testnet,
              status: IPaymentStatus.initiated,
              onPaymentStarted,
              onPaymentCompleted,
              onPaymentFailed,
              payload,
            }))
          }
        />
      ) : (
        <Button
          onClick={() =>
            setState((state) => ({
              ...state,
              apiKey,
              testnet,
              status: IPaymentStatus.initiated,
              onPaymentStarted,
              onPaymentCompleted,
              onPaymentFailed,
              payload,
            }))
          }
        >
          Pay
        </Button>
      );
    default:
      return (
        <Portal portalTarget={crayModal!}>
          <style>{css}</style>
          <style>{typography}</style>
          <div className="bg-black/50 fixed !z-[999999] top-0 left-0 w-screen h-screen flex items-center justify-center text-black">
            <div className="relative  overflow-hidden w-full md:w-[480px] h-full md:h-auto mx-auto  shadow-sm bg-white rounded-[16px]">
              <CloseIcon />
              <PayModal apiKey={apiKey} testnet={testnet} payload={payload} />
            </div>
          </div>
        </Portal>
      );
  }
};
export default PayWidget;
