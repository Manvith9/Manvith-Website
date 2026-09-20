## *Linux GPIO Character Device Driver*
### Operating Systems · Embedded Linux

### • C, Linux Kernel, Raspberry Pi
### • GPIO, Device Drivers, LKM

### Overview

I developed a Linux character device driver in C for direct Raspberry Pi GPIO control using the Linux Kernel Module framework, working directly across the boundary between user-space applications, kernel-space software, and physical hardware.

### Implementation

I implemented ioctl() interfaces for GPIO configuration and control, created user-space applications for interacting with the driver, and developed Makefiles for compiling, loading, and deploying the kernel module on Embedded Linux.

### Systems Focus

I validated driver functionality using Linux kernel logs through dmesg, system utilities, and command-line debugging tools. Building the driver gave me a deeper understanding of operating-system abstractions and the software interfaces connecting applications to hardware.
