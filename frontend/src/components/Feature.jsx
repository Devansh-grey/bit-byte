import React from "react";

// Reusable Card Component
const FeatureCard = ({ icon, title, desc, borderRight }) => {
    return (
        <div
            className={`p-8 flex flex-col gap-4 border-black 
      border-b-2 md:border-b-0 
      ${borderRight ? "md:border-r-2" : ""}`}
        >
            {/* Icon */}
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    {icon}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-headline font-bold text-xl uppercase">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed">
                {desc}
            </p>
        </div>
    );
};

const Feature = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 w-full border-b-2 border-black">

            {/* <FeatureCard
        icon="lock"
        title="End-to-End Encryption"
        desc="Pure cryptographic isolation. No metadata harvesting. No central server logging. Your packets are your own property."
        borderRight
      />

      <FeatureCard
        icon="bolt"
        title="Zero Latency Sync"
        desc="Built on the Analog Protocol. Direct peer-to-peer transmission ensures messages arrive at the speed of the wire."
        borderRight
      />

      <FeatureCard
        icon="terminal"
        title="Terminal First"
        desc="Designed for operators. A command-line interface that respects your screen real estate and your CPU cycles."
      /> */}
            <FeatureCard
                icon="bolt"
                title="Real-Time Messaging"
                desc="No refresh. No delay. Messages are delivered instantly using persistent connections."
                borderRight
            />

            <FeatureCard
                icon="visibility"
                title="Read Receipts"
                desc="See message status and unread counts in real time. No guessing, just clarity."
                borderRight
            />

            <FeatureCard
                icon="search"
                title="User Search"
                desc="Find users and start a conversation instantly. No friction, no extra steps."
            />

        </section>
    );
};

export default Feature;