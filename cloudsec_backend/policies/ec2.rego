package cloudsec.ec2

default deny = []

deny contains msg if {
    # Check for instances without proper tags
    some reservation in input.ec2.Reservations
    some instance in reservation.Instances
    not instance.Tags
    msg := sprintf("⚠️ EC2 instance %s has no tags", [instance.InstanceId])
}

deny contains msg if {
    # Check security groups in EC2 instances
    some reservation in input.ec2.Reservations
    some instance in reservation.Instances
    count(instance.SecurityGroups) > 0
    some sg in instance.SecurityGroups
    sg_id := sg.GroupId
    sg_name := sg.GroupName
    msg := sprintf("⚠️ EC2 instance %s has security group %s (%s)", [instance.InstanceId, sg_id, sg_name])
}
