package org.rivers.service;

import org.quartz.SchedulerException;
import org.rivers.config.GlobalConfig;
import org.rivers.schedule.JobModel;
import org.rivers.util.RiverSchedule;

public class Run {

	public void start() {
		JobModel job = new JobModel("AutoBackUp",GlobalConfig.backupCron, "com.feiniu.river.service.RiverCenter", "backup",
				null);
		try {
			RiverSchedule.addJob(job);
		} catch (SchedulerException e) {
			e.printStackTrace();
		}
	}

}
